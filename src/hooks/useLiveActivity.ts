import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CarPlaySnapshot, FerryLive, FerryLiveState } from "../../modules/ferry-live";
import { DepartureInfo } from "./useNextDepartures";
import { ROUTES } from "../utils/constants";
import { formatTime } from "../utils/time";
import { BestSailingResult, SailingPick } from "../utils/bestSailing";
import { withEnRoute } from "../utils/liveSpots";

export function toLiveState(
  best: SailingPick<DepartureInfo>,
  alt: SailingPick<DepartureInfo> | undefined,
): FerryLiveState {
  const note = best.bumpedByOverflow
    ? "Next boat likely full for cars"
    : alt
      ? `Or ${ROUTES[alt.route].label} ${formatTime(alt.targetTime)}`
      : null;
  return {
    routeLabel: ROUTES[best.route].label,
    terminal: best.terminalLabel,
    departureMs: best.targetTime.getTime(),
    leaveByMs: best.leaveBy.getTime(),
    arrivalMs: best.arrivalTime.getTime(),
    driveMinutes: best.driveMinutes,
    note,
    spaces: best.target.driveUpSpaces,
    vesselName: best.target.vesselName,
  };
}

/**
 * Mirror a plan into a Live Activity (Lock Screen, Dynamic Island, and the
 * CarPlay dashboard on iOS 26+): the best sailing from here, or the commute
 * leave-by from the Ferry tab. Opt-in via `toggle`; once on, re-pushes only when
 * the content actually changes — the countdown itself ticks natively.
 *
 * For a car, once leave-by passes the activity switches to drive-up spaces
 * left (see liveSpots.ts). That's sticky for the session: re-planning from
 * your new position slides leave-by later, but you're already on your way.
 */
export function useLiveActivity(
  source: { state: FerryLiveState; car: boolean } | null,
  nowMs: number,
) {
  const supported = !!FerryLive?.areActivitiesEnabled();
  const [active, setActive] = useState(() => !!FerryLive?.isActive());
  const lastPushed = useRef<string | null>(null);
  const enRoute = useRef(false);
  const startSpaces = useRef(new Map<number, number>());

  useEffect(() => {
    if (!FerryLive || !active || !source) return;
    const state = withEnRoute(source, nowMs, true, enRoute.current, startSpaces.current);
    if (state.enRoute) enRoute.current = true;
    const key = JSON.stringify(state);
    if (key === lastPushed.current) return;
    lastPushed.current = key;
    FerryLive.startOrUpdate(state).catch((e) => {
      console.warn("Live Activity update failed", e);
      setActive(false);
    });
  }, [active, source, nowMs]);

  const toggle = useCallback(() => {
    if (!FerryLive) return;
    if (active) {
      lastPushed.current = null;
      enRoute.current = false;
      startSpaces.current.clear();
      setActive(false);
      FerryLive.end().catch(() => {});
    } else {
      setActive(true);
    }
  }, [active]);

  return { supported, active, toggle };
}

export function toCarPlaySnapshot(
  hasLocation: boolean,
  { best, alternatives }: BestSailingResult<DepartureInfo>,
): CarPlaySnapshot {
  return {
    hasLocation,
    best: best ? toLiveState(best, alternatives[0]) : null,
    followingDepartureMs: best?.following?.scheduledDeparture.getTime() ?? null,
    followingSpaces: best?.following?.driveUpSpaces ?? null,
    alternatives: alternatives.map((a) => toLiveState(a, undefined)),
  };
}

/**
 * Keep the CarPlay screen's snapshot current. Always on (it's in-process and
 * cheap); pushes only on content changes. No-op on builds without CarPlay.
 */
export function useCarPlaySnapshot(
  hasLocation: boolean,
  result: BestSailingResult<DepartureInfo>,
) {
  const lastPushed = useRef<string | null>(null);
  const json = useMemo(
    () => JSON.stringify(toCarPlaySnapshot(hasLocation, result)),
    [hasLocation, result],
  );

  useEffect(() => {
    if (!FerryLive?.setCarPlaySnapshot || json === lastPushed.current) return;
    lastPushed.current = json;
    try {
      FerryLive.setCarPlaySnapshot(json);
    } catch {
      // Malformed payload is a bug, but never worth crashing the phone UI.
    }
  }, [json]);
}
