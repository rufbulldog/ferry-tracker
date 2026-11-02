/**
 * The Live Activity's two faces for a car: "Leave in mm:ss" until leave-by,
 * then — once you're on your way — drive-up spaces left on the boat, with
 * how many there were when you set off.
 */
import type { FerryLiveState } from "../../modules/ferry-live";

// "Leave now": Best from here re-plans to a sailing you can still make, so its
// leave-by never actually passes — it bottoms out here. That's the moment you
// should already be driving.
export const LEAVE_NOW_MS = 60_000;

export function withEnRoute(
  source: { state: FerryLiveState; car: boolean },
  nowMs: number,
  liveOn: boolean,
  alreadyEnRoute: boolean,
  startSpaces: Map<number, number>,
): FerryLiveState {
  const { state, car } = source;
  const enRoute = car && liveOn && (alreadyEnRoute || nowMs >= state.leaveByMs - LEAVE_NOW_MS);
  if (!enRoute) return { ...state, enRoute: false };
  const spaces = state.spaces ?? null;
  // First count seen for this sailing while under way.
  if (spaces != null && !startSpaces.has(state.departureMs)) {
    startSpaces.set(state.departureMs, spaces);
  }
  return {
    ...state,
    enRoute: true,
    startSpaces: startSpaces.get(state.departureMs) ?? null,
  };
}
