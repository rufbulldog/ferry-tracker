/**
 * GET /plan — the "best sailing from here" brain, server-side, for clients
 * that aren't the Ferry Tracker app (kamilche-trip, a future Watch app).
 *
 * Pure: the handler (index.ts) fetches WSF + recorded history and hands it
 * here. The departure composition, car-overflow estimate and sailing picker are
 * the app's own modules in ../../../src/utils, bundled in by esbuild, so the
 * backend and the app can't drift apart.
 */
import {
  composeDepartures,
  DepartureInfo,
} from "../../../src/utils/composeDepartures";
import {
  processBulletins,
  pickActiveAlert,
} from "../../../src/utils/bulletins";
import { estimateCarWait, CarWaitEstimate } from "../../../src/utils/carWait";
import {
  deriveSailingIntervalMinutes,
  effectiveFerryDeparture,
} from "../../../src/utils/ferryDeparture";
import { computeTypicalForSlot } from "../../../src/utils/typicalConditions";
import {
  pickBestSailing,
  SailingCandidate,
  SailingPick,
} from "../../../src/utils/bestSailing";
import { haversineDistance } from "../../../src/utils/geo";
import {
  ROUTES,
  Route,
  crossingMinutesForRoute,
} from "../../../src/utils/constants";
import { TRAVEL_TIMES } from "../../../src/utils/transitConfig";
import { parseDate, addMinutes } from "../../../src/utils/time";
import type {
  TerminalBulletin,
  TerminalSailingSpace,
  VesselLocation,
  WaitTime,
} from "../../../src/api/types";
import type { DepartureSnapshot } from "../../../src/types/storage";

// WSF terminal ids → where they are (public, published by WSDOT).
export const TERMINALS: Record<
  number,
  { name: string; lat: number; lon: number }
> = {
  3: { name: "Bainbridge", lat: 47.6235, lon: -122.5104 },
  4: { name: "Bremerton", lat: 47.5622, lon: -122.6247 },
  7: { name: "Seattle", lat: 47.6023, lon: -122.3384 },
  8: { name: "Edmonds", lat: 47.8106, lon: -122.3844 },
  12: { name: "Kingston", lat: 47.7964, lon: -122.4949 },
};

export interface PlanRoute {
  from: number;
  to: number;
  label: string;
  crossingMinutes: number;
  /** Minutes to arrive before a sailing with a car. */
  carBufferMinutes: number;
  /** The collector records this route, so there's history for car overflow. */
  hasHistory: boolean;
}

// Fallback car buffer when a route has no car config (minutes) — matches useBestSailing.
const DEFAULT_CAR_BUFFER_MINUTES = 10;
// Fallback spacing when the live schedule can't give one — matches useCarWait.
const DEFAULT_SAILING_INTERVAL = 50;

const appRoute = (id: Route): PlanRoute => ({
  from: ROUTES[id].from,
  to: ROUTES[id].to,
  label: ROUTES[id].label,
  crossingMinutes: crossingMinutesForRoute(id),
  carBufferMinutes: TRAVEL_TIMES[id].car?.buffer ?? DEFAULT_CAR_BUFFER_MINUTES,
  hasHistory: true,
});

// The app's four routes, plus Seattle ⇄ Bremerton (kamilche-trip's other
// option), which the app doesn't show and the collector doesn't record.
export const PLAN_ROUTES: Record<string, PlanRoute> = {
  "bainbridge-seattle": appRoute("bainbridge-seattle"),
  "seattle-bainbridge": appRoute("seattle-bainbridge"),
  "kingston-edmonds": appRoute("kingston-edmonds"),
  "edmonds-kingston": appRoute("edmonds-kingston"),
  "seattle-bremerton": {
    from: 7,
    to: 4,
    label: "Seattle → Bremerton",
    crossingMinutes: 60,
    carBufferMinutes: DEFAULT_CAR_BUFFER_MINUTES,
    hasHistory: false,
  },
  "bremerton-seattle": {
    from: 4,
    to: 7,
    label: "Bremerton → Seattle",
    crossingMinutes: 60,
    carBufferMinutes: DEFAULT_CAR_BUFFER_MINUTES,
    hasHistory: false,
  },
};

export interface PlanQuery {
  location: { lat: number; lon: number } | null;
  routes: string[];
  /** Upcoming sailings to list per route. */
  sailings: number;
  /** Overrides each route's car buffer. */
  bufferMinutes: number | null;
}

export type ParseResult =
  { ok: true; query: PlanQuery } | { ok: false; error: string };

const MAX_SAILINGS = 10;

function numberParam(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}

export function parsePlanQuery(
  params: Record<string, string | undefined> | null,
): ParseResult {
  const p = params ?? {};
  const lat = numberParam(p.lat);
  const lon = numberParam(p.lon);
  if ((lat === null) !== (lon === null))
    return { ok: false, error: "Pass both lat and lon, or neither" };
  if (lat !== null && lon !== null) {
    if (Number.isNaN(lat) || lat < -90 || lat > 90)
      return { ok: false, error: "lat must be -90..90" };
    if (Number.isNaN(lon) || lon < -180 || lon > 180)
      return { ok: false, error: "lon must be -180..180" };
  }

  const routes = p.routes
    ? [
        ...new Set(
          p.routes
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean),
        ),
      ]
    : Object.keys(PLAN_ROUTES);
  const unknown = routes.filter((r) => !PLAN_ROUTES[r]);
  if (unknown.length > 0) {
    return {
      ok: false,
      error: `Unknown route(s): ${unknown.join(", ")}. Known: ${Object.keys(PLAN_ROUTES).join(", ")}`,
    };
  }
  if (routes.length === 0) return { ok: false, error: "routes is empty" };

  const sailings = numberParam(p.sailings) ?? 3;
  if (!Number.isInteger(sailings) || sailings < 1 || sailings > MAX_SAILINGS) {
    return { ok: false, error: `sailings must be 1..${MAX_SAILINGS}` };
  }
  const bufferMinutes = numberParam(p.buffer);
  if (
    bufferMinutes !== null &&
    (Number.isNaN(bufferMinutes) || bufferMinutes < 0 || bufferMinutes > 120)
  ) {
    return { ok: false, error: "buffer must be 0..120 minutes" };
  }

  return {
    ok: true,
    query: {
      location: lat !== null && lon !== null ? { lat, lon } : null,
      routes,
      sailings,
      bufferMinutes,
    },
  };
}

/**
 * Routes to plan against. A terminal pair is one crossing; you're on whichever
 * side is nearer, so only that direction is a candidate (Bainbridge → Seattle
 * from Seattle would mean driving around the Sound).
 */
export function candidateRoutes(
  routes: string[],
  location: { lat: number; lon: number },
): string[] {
  const byPair = new Map<string, { id: string; distance: number }>();
  for (const id of routes) {
    const r = PLAN_ROUTES[id];
    const t = TERMINALS[r.from];
    const distance = haversineDistance(
      location.lat,
      location.lon,
      t.lat,
      t.lon,
    );
    const key = [r.from, r.to].sort((a, b) => a - b).join("-");
    const current = byPair.get(key);
    if (!current || distance < current.distance)
      byPair.set(key, { id, distance });
  }
  return [...byPair.values()].map((v) => v.id);
}

/** Raw inputs the handler gathered. Per-terminal maps are keyed by WSF terminal id. */
export interface PlanInputs {
  vessels: VesselLocation[] | undefined;
  terminals: TerminalSailingSpace[] | undefined;
  waitTimes: Record<number, WaitTime[] | undefined>;
  bulletins: Record<number, TerminalBulletin[] | undefined>;
  /** Recorded departures (last ~14 days) per route id. */
  history: Record<string, DepartureSnapshot[] | undefined>;
  /** Timetable sailings per route id, for routes the sailing-space feed doesn't cover. */
  schedules?: Record<string, ScheduledSailing[] | undefined>;
}

/** One row of WSF's schedule `Times` (the fields we use). */
export interface ScheduledSailing {
  DepartingTime: string; // "/Date(1234567890000-0800)/"
  VesselID: number;
  VesselName: string;
}

/** True when WSF's sailing-space feed lists departures for this route. */
export function hasSailingSpace(terminals: TerminalSailingSpace[] | undefined, routeId: string): boolean {
  const r = PLAN_ROUTES[routeId];
  const t = terminals?.find((x) => x.TerminalID === r.from);
  return !!t?.DepartingSpaces.some((d) => d.SpaceForArrivalTerminals.some((a) => a.TerminalID === r.to));
}

/**
 * WSF only publishes sailing space for terminals that track drive-up space
 * (Seattle and Bremerton are often absent). For those routes, stand in the
 * timetable as space-less departures so composeDepartures still matches live
 * vessels for delays; car overflow then reads as unknown.
 */
function sailingSpaceFor(routeId: string, inputs: PlanInputs): TerminalSailingSpace[] | undefined {
  const times = inputs.schedules?.[routeId];
  if (hasSailingSpace(inputs.terminals, routeId) || !times?.length) return inputs.terminals;
  const r = PLAN_ROUTES[routeId];
  const timetable = {
    TerminalID: r.from,
    DepartingSpaces: times.map((t) => ({
      Departure: t.DepartingTime,
      IsCancelled: false,
      VesselID: t.VesselID,
      VesselName: t.VesselName,
      MaxSpaceCount: 0,
      SpaceForArrivalTerminals: [{ TerminalID: r.to, DriveUpSpaceCount: null }],
    })),
  } as unknown as TerminalSailingSpace;
  return [timetable, ...(inputs.terminals ?? []).filter((t) => t.TerminalID !== r.from)];
}

export interface SailingOut {
  scheduledDeparture: string;
  /** Best current estimate of when it leaves (or actually left). */
  departure: string;
  delayMinutes: number;
  /** Live vessel ETA once under way, else departure + crossing. */
  arrival: string;
  status: DepartureInfo["status"];
  vesselName: string;
  driveUpSpaces: number | null;
  maxSpaces: number;
  isCancelled: boolean;
}

export interface CarWaitOut {
  extraSailings: number;
  extraMinutes: number;
  atRisk: boolean;
  reason: CarWaitEstimate["reason"];
  confidence: CarWaitEstimate["confidence"];
  note: string | null;
}

export interface RouteOut {
  route: string;
  label: string;
  from: { id: number; name: string };
  to: { id: number; name: string };
  crossingMinutes: number;
  carWait: CarWaitOut;
  /** Boats on the water now, then the next upcoming sailings. */
  sailings: SailingOut[];
}

export interface PickOut {
  route: string;
  label: string;
  terminal: string;
  driveMinutes: number;
  /** Latest time to start driving and still make it. */
  leaveBy: string;
  slackMinutes: number;
  /** The departure time the plan is built against. */
  departure: string;
  arrival: string;
  bumpedByOverflow: boolean;
  sailing: SailingOut;
  following: SailingOut | null;
  reasoning: string[];
}

export interface PlanResponse {
  generatedAt: string;
  location: { lat: number; lon: number } | null;
  /** Null without a location, or when no route has a catchable sailing. */
  best: PickOut | null;
  alternatives: PickOut[];
  routes: RouteOut[];
}

function sailingOut(d: DepartureInfo, route: PlanRoute): SailingOut {
  const eff = effectiveFerryDeparture(d);
  const liveEta =
    d.status === "departed"
      ? (parseDate(d.etaRaw) ?? d.vesselArrivalEta)
      : null;
  return {
    scheduledDeparture: d.scheduledDeparture.toISOString(),
    departure: eff.time.toISOString(),
    delayMinutes: eff.delayMinutes,
    arrival: (
      liveEta ?? addMinutes(eff.time, route.crossingMinutes)
    ).toISOString(),
    status: d.status,
    vesselName: d.vesselName,
    driveUpSpaces: d.driveUpSpaces,
    maxSpaces: d.maxSpaces,
    isCancelled: d.isCancelled,
  };
}

function carWaitFor(
  id: string,
  departures: DepartureInfo[],
  inputs: PlanInputs,
): CarWaitEstimate {
  const route = PLAN_ROUTES[id];
  const next = departures.find(
    (d) => d.status !== "departed" && !d.isCancelled,
  );
  if (!next)
    return estimateCarWait({
      liveDriveUpSpaces: null,
      maxSpaces: 0,
      historicalCapacityPercent: null,
      historicalSampleSize: 0,
      waitNoteText: null,
      alertText: null,
      sailingIntervalMinutes: DEFAULT_SAILING_INTERVAL,
    });

  const notes = (inputs.waitTimes[route.from] ?? [])
    .map((w) => w.WaitTimeNotes?.trim())
    .filter((n): n is string => !!n)
    .join(" · ");
  const alert = pickActiveAlert(
    processBulletins(inputs.bulletins[route.from], id),
  );
  const typical = computeTypicalForSlot(
    inputs.history[id],
    next.scheduledDeparture,
  );

  return estimateCarWait({
    liveDriveUpSpaces: next.driveUpSpaces,
    maxSpaces: next.maxSpaces,
    historicalCapacityPercent: typical.capacityPercent,
    historicalSampleSize: typical.sampleSize,
    waitNoteText: notes.length > 0 ? notes : null,
    alertText: alert?.text ?? null,
    sailingIntervalMinutes: deriveSailingIntervalMinutes(
      departures.map((d) => d.scheduledDeparture),
      DEFAULT_SAILING_INTERVAL,
    ),
  });
}

function pickOut(p: SailingPick<DepartureInfo, string>): PickOut {
  const route = PLAN_ROUTES[p.route];
  return {
    route: p.route,
    label: route.label,
    terminal: p.terminalLabel,
    driveMinutes: p.driveMinutes,
    leaveBy: p.leaveBy.toISOString(),
    slackMinutes: p.slackMinutes,
    departure: p.targetTime.toISOString(),
    arrival: p.arrivalTime.toISOString(),
    bumpedByOverflow: p.bumpedByOverflow,
    sailing: sailingOut(p.target, route),
    following: p.following ? sailingOut(p.following, route) : null,
    reasoning: p.reasoning,
  };
}

export function buildPlan(
  query: PlanQuery,
  inputs: PlanInputs,
  now: Date,
): PlanResponse {
  const departuresByRoute = new Map<string, DepartureInfo[]>();
  const carWaitByRoute = new Map<string, CarWaitEstimate>();
  for (const id of query.routes) {
    const r = PLAN_ROUTES[id];
    const deps = composeDepartures(
      r.from,
      r.to,
      inputs.vessels,
      sailingSpaceFor(id, inputs),
      now.getTime(),
    );
    departuresByRoute.set(id, deps);
    carWaitByRoute.set(id, carWaitFor(id, deps, inputs));
  }

  const routes: RouteOut[] = query.routes.map((id) => {
    const r = PLAN_ROUTES[id];
    const deps = departuresByRoute.get(id)!;
    const onTheWater = deps.filter((d) => {
      if (d.status !== "departed") return false;
      const eta = parseDate(d.etaRaw) ?? d.vesselArrivalEta;
      return !!eta && eta.getTime() > now.getTime();
    });
    const upcoming = deps
      .filter((d) => d.status !== "departed")
      .slice(0, query.sailings);
    const cw = carWaitByRoute.get(id)!;
    return {
      route: id,
      label: r.label,
      from: { id: r.from, name: TERMINALS[r.from].name },
      to: { id: r.to, name: TERMINALS[r.to].name },
      crossingMinutes: r.crossingMinutes,
      carWait: {
        extraSailings: cw.extraSailings,
        extraMinutes: cw.extraMinutes,
        atRisk: cw.atRisk,
        reason: cw.reason,
        confidence: cw.confidence,
        note: cw.note,
      },
      sailings: [...onTheWater, ...upcoming].map((d) => sailingOut(d, r)),
    };
  });

  let best: PickOut | null = null;
  let alternatives: PickOut[] = [];
  if (query.location) {
    const { lat, lon } = query.location;
    const candidates: SailingCandidate<DepartureInfo, string>[] =
      candidateRoutes(query.routes, query.location).map((id) => {
        const r = PLAN_ROUTES[id];
        const t = TERMINALS[r.from];
        return {
          route: id,
          terminalLabel: t.name,
          distanceMeters: haversineDistance(lat, lon, t.lat, t.lon),
          departures: departuresByRoute.get(id)!,
          bufferMinutes: query.bufferMinutes ?? r.carBufferMinutes,
          carExtraSailings: carWaitByRoute.get(id)!.extraSailings,
          crossingMinutes: r.crossingMinutes,
        };
      });
    const result = pickBestSailing(candidates, now);
    best = result.best ? pickOut(result.best) : null;
    alternatives = result.alternatives.map(pickOut);
  }

  return {
    generatedAt: now.toISOString(),
    location: query.location,
    best,
    alternatives,
    routes,
  };
}

/** WSF terminals whose wait notes + bulletins the query needs. */
export function departingTerminals(routes: string[]): number[] {
  return [...new Set(routes.map((id) => PLAN_ROUTES[id].from))];
}
