import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CarPlaySnapshot, FerryLive, FerryLiveState } from "../../modules/ferry-live";
import { DepartureInfo } from "./useNextDepartures";
import { ROUTES } from "../utils/constants";
import { formatTime } from "../utils/time";
import { BestSailingResult, SailingPick } from "../utils/bestSailing";

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
  };
}

/**
 * Mirror the best-sailing plan into a Live Activity (Lock Screen, Dynamic
 * Island, and the CarPlay dashboard on iOS 26+). Opt-in via `toggle`; once on,
 * re-pushes only when the plan's content actually changes — the countdown
 * itself ticks natively. Updates stop while the app is backgrounded.
 */
export function useLiveActivity(
  best: SailingPick<DepartureInfo> | null,
  alt: SailingPick<DepartureInfo> | undefined,
) {
  const supported = !!FerryLive?.areActivitiesEnabled();
  const [active, setActive] = useState(() => !!FerryLive?.isActive());
  const lastPushed = useRef<string | null>(null);

  const state = useMemo(
    () => (best ? toLiveState(best, alt) : null),
    [best, alt],
  );
  const key = state ? JSON.stringify(state) : null;

  useEffect(() => {
    if (!FerryLive || !active || !state || key === lastPushed.current) return;
    lastPushed.current = key;
    FerryLive.startOrUpdate(state).catch((e) => {
      console.warn("Live Activity update failed", e);
      setActive(false);
    });
  }, [active, state, key]);

  const toggle = useCallback(() => {
    if (!FerryLive) return;
    if (active) {
      lastPushed.current = null;
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
