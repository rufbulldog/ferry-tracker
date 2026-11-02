import { useEffect, useMemo, useState } from "react";
import { useNextDepartures, DepartureInfo } from "./useNextDepartures";
import { useCarWait } from "./useCarWait";
import { useWatchedLocation } from "./useWatchedLocation";
import { Route, crossingMinutesForRoute } from "../utils/constants";
import { getTerminalLocation, haversineDistance } from "../utils/locations";
import { TRAVEL_TIMES } from "../utils/transitConfig";
import {
  pickBestSailing,
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
const GROUPS: [GroupSide, GroupSide][] = [
  [
    {
      route: "bainbridge-seattle",
      terminalId: "bi-terminal",
      label: "Bainbridge",
    },
    {
      route: "seattle-bainbridge",
      terminalId: "seattle-terminal",
      label: "Seattle",
    },
  ],
  [
    {
      route: "kingston-edmonds",
      terminalId: "kingston-terminal",
      label: "Kingston",
    },
    {
      route: "edmonds-kingston",
      terminalId: "edmonds-terminal",
      label: "Edmonds",
    },
  ],
];

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
  const sides = useMemo(
    () =>
      GROUPS.map((g) =>
        location
          ? nearerSide(g, location.latitude, location.longitude)
          : { side: g[0], distanceMeters: Infinity },
      ),
    [location],
  );

  const bainbridgeRoute = sides[0].side.route;
  const kingstonRoute = sides[1].side.route;
  const { data: bainbridgeDepartures } = useNextDepartures(bainbridgeRoute);
  const { data: kingstonDepartures } = useNextDepartures(kingstonRoute);
  const bainbridgeCarWait = useCarWait(bainbridgeRoute);
  const kingstonCarWait = useCarWait(kingstonRoute);

  return useMemo(() => {
    if (!location) return { best: null, alternatives: [], hasLocation: false };

    const data = [
      { departures: bainbridgeDepartures, carWait: bainbridgeCarWait },
      { departures: kingstonDepartures, carWait: kingstonCarWait },
    ];
    const candidates: SailingCandidate<DepartureInfo>[] = sides.map(
      ({ side, distanceMeters }, i) => ({
        route: side.route,
        terminalLabel: side.label,
        distanceMeters,
        departures: data[i].departures ?? [],
        bufferMinutes:
          TRAVEL_TIMES[side.route].car?.buffer ?? DEFAULT_CAR_BUFFER_MINUTES,
        carExtraSailings: data[i].carWait.estimate.extraSailings,
        crossingMinutes: crossingMinutesForRoute(side.route),
      }),
    );

    return { ...pickBestSailing(candidates, now), hasLocation: true };
  }, [
    location,
    sides,
    bainbridgeDepartures,
    kingstonDepartures,
    bainbridgeCarWait,
    kingstonCarWait,
    now,
  ]);
}
