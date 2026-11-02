import { useEffect, useMemo, useState } from "react";
import { useNextDepartures, DepartureInfo } from "./useNextDepartures";
import { useCarWait } from "./useCarWait";
import { useWatchedLocation } from "./useWatchedLocation";
import { Route, crossingMinutesForRoute } from "../utils/constants";
import { ALL_ROUTE_GROUPS, ROUTE_GROUPS, RouteGroup } from "../utils/routeGroups";
import { useRoute } from "../context/RouteContext";
import {
  getPublicTerminals,
  getTerminalLocation,
  haversineDistance,
} from "../utils/locations";
import { getPersonalLocations } from "../store/personalLocations";
import { isAwayFromCommute } from "../utils/commute";
import { DrivePoint, useDriveTimes, useDriveTimesTo } from "./useDriveTimes";
import { TRAVEL_TIMES } from "../utils/transitConfig";
import {
  DriveAround,
  pickBestSailing,
  planDriveAround,
  BestSailingResult,
  SailingCandidate,
} from "../utils/bestSailing";

// Fallback car buffer when a route has no car config (minutes).
const DEFAULT_CAR_BUFFER_MINUTES = 10;
// Re-plan on the clock too, not just on GPS/data changes — slack ticks down.
const TICK_MS = 30_000;

interface GroupSide {
  route: Route;
  terminalId: string;
  label: string;
}

// Each route group's two departure options; whichever terminal is nearer is
// the side of the water you're on.
const GROUPS: { group: RouteGroup; sides: [GroupSide, GroupSide] }[] =
  ALL_ROUTE_GROUPS.map((group) => {
    const g = ROUTE_GROUPS[group];
    return {
      group,
      sides: [
        { route: g.outbound, terminalId: g.outboundTerminalId, label: g.outboundLabel },
        { route: g.inbound, terminalId: g.inboundTerminalId, label: g.inboundLabel },
      ],
    };
  });

function nearerSide(
  sides: [GroupSide, GroupSide],
  lat: number,
  lon: number,
): { side: GroupSide; distanceMeters: number } {
  const [a, b] = sides.map((s) => {
    const t = getTerminalLocation(s.terminalId)!;
    return {
      side: s,
      distanceMeters: haversineDistance(lat, lon, t.lat, t.lon),
    };
  });
  return a.distanceMeters <= b.distanceMeters ? a : b;
}

export interface BestSailingState extends BestSailingResult<DepartureInfo> {
  hasLocation: boolean;
  /** Away from saved home/work and terminals — likely driving, not commuting. */
  awayFromCommute: boolean;
  /** Skip the ferry and drive home (away from the commute, home saved, road time known). */
  driveAround: DriveAround | null;
}

/**
 * Best sailing to drive to from your current position, across both route
 * groups (always planned as a car). Live data per route is shared with the rest
 * of the app through react-query, so this adds no extra polling of vessels or
 * terminal space.
 */
export function useBestSailing(): BestSailingState {
  const location = useWatchedLocation();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Before a fix arrives, default to the Kitsap side (hooks below must be
  // called with some route either way).
  const { enabledGroups } = useRoute();

  const sides = useMemo(
    () =>
      GROUPS.map((g) =>
        location
          ? nearerSide(g.sides, location.latitude, location.longitude)
          : { side: g.sides[0], distanceMeters: Infinity },
      ),
    [location],
  );

  // Hooks run for every group (fixed call order: bainbridge, kingston,
  // bremerton). A disabled group's slot borrows an enabled group's route, so
  // react-query dedupes it instead of polling a route nobody uses; its result
  // is dropped from the candidates below.
  const isOn = (i: number) => enabledGroups.includes(GROUPS[i].group);
  const sharedRoute = sides[GROUPS.findIndex((_, i) => isOn(i))]?.side.route ?? sides[0].side.route;
  const hookRoute = (i: number) => (isOn(i) ? sides[i].side.route : sharedRoute);
  const { data: bainbridgeDepartures, isLoading: bainbridgeLoading } = useNextDepartures(hookRoute(0));
  const { data: kingstonDepartures, isLoading: kingstonLoading } = useNextDepartures(hookRoute(1));
  const { data: bremertonDepartures, isLoading: bremertonLoading } = useNextDepartures(hookRoute(2));
  // "No ferry gets you there sooner" needs the ferries loaded first.
  const ferriesLoaded = !bainbridgeLoading && !kingstonLoading && !bremertonLoading;
  const bainbridgeCarWait = useCarWait(hookRoute(0));
  const kingstonCarWait = useCarWait(hookRoute(1));
  const bremertonCarWait = useCarWait(hookRoute(2));

  // Off the commute with home saved, plan for getting home: real road times
  // (Apple Maps) to each terminal, from each far terminal home, and straight
  // home around the Sound. On older builds these come back empty and the
  // straight-line estimate stands.
  const awayFromCommute =
    !!location &&
    isAwayFromCommute(
      location.latitude,
      location.longitude,
      getPersonalLocations(),
      getPublicTerminals(),
    );
  const home = getPersonalLocations().find((l) => l.id === "home") ?? null;
  // Only when home is across the water: on home's own side no ferry gets you
  // there, so "home by" rankings and drive-around would be nonsense.
  const homeAcross =
    !!home &&
    GROUPS.some(
      (g, i) =>
        isOn(i) &&
        nearerSide(g.sides, home.lat, home.lon).side.route !== sides[i].side.route,
    );
  const planHome = awayFromCommute && homeAcross;
  const onRoutes = sides.filter((_, i) => isOn(i));
  const terminalPoints: DrivePoint[] = onRoutes.map(({ side }) => {
    const t = getTerminalLocation(side.terminalId)!;
    return { id: side.route, lat: t.lat, lon: t.lon };
  });
  const roadMinutes = useDriveTimes(
    location ? { lat: location.latitude, lon: location.longitude } : null,
    planHome ? [...terminalPoints, { id: "home", lat: home!.lat, lon: home!.lon }] : terminalPoints,
  );
  const farTerminals: DrivePoint[] = onRoutes.map(({ side }) => {
    const group = GROUPS.find((g) => g.sides.includes(side))!;
    const far = group.sides.find((x) => x !== side)!;
    const t = getTerminalLocation(far.terminalId)!;
    return { id: side.route, lat: t.lat, lon: t.lon };
  });
  const farToHome = useDriveTimesTo(
    planHome ? farTerminals : [],
    planHome ? { lat: home!.lat, lon: home!.lon } : null,
  );

  return useMemo(() => {
    if (!location) {
      return {
        best: null, alternatives: [], hasLocation: false,
        awayFromCommute: false, driveAround: null,
      };
    }

    const data = [
      { departures: bainbridgeDepartures, carWait: bainbridgeCarWait },
      { departures: kingstonDepartures, carWait: kingstonCarWait },
      { departures: bremertonDepartures, carWait: bremertonCarWait },
    ];
    const candidates: SailingCandidate<DepartureInfo>[] = sides
      .map((s, i) => ({ ...s, i }))
      .filter(({ i }) => enabledGroups.includes(GROUPS[i].group))
      .map(({ side, distanceMeters, i }) => ({
        route: side.route,
        terminalLabel: side.label,
        distanceMeters,
        departures: data[i].departures ?? [],
        bufferMinutes:
          TRAVEL_TIMES[side.route].car?.buffer ?? DEFAULT_CAR_BUFFER_MINUTES,
        carExtraSailings: data[i].carWait.estimate.extraSailings,
        crossingMinutes: crossingMinutesForRoute(side.route),
        roadDriveMinutes: roadMinutes[side.route] ?? null,
        homeDriveMinutes: planHome ? (farToHome[side.route] ?? null) : null,
      }),
    );

    const result = pickBestSailing(candidates, now);
    const driveAround = planHome && ferriesLoaded
      ? planDriveAround(roadMinutes.home, result.best, now)
      : null;
    return { ...result, hasLocation: true, awayFromCommute, driveAround };
  }, [
    location,
    sides,
    bainbridgeDepartures,
    kingstonDepartures,
    bainbridgeCarWait,
    kingstonCarWait,
    bremertonDepartures,
    bremertonCarWait,
    enabledGroups,
    awayFromCommute,
    planHome,
    roadMinutes,
    farToHome,
    ferriesLoaded,
    now,
  ]);
}
