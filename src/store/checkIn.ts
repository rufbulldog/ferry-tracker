import { Route } from '../utils/constants';

/**
 * Session "I'm aboard" pin. Pressing Send ETA records which sailing the user is
 * actually on (the boat loading / just arrived at their terminal) so the ETA
 * stays locked to it and doesn't drift to the next sailing — or a far-off
 * returning-vessel projection — during the loading→departed transition.
 *
 * In-memory only: a check-in is meaningful for one crossing and is allowed to
 * lapse if the app is killed. It also self-expires by time in useArrivalEta.
 */
export interface CheckIn {
  route: Route;
  vesselId: number;
  scheduledDeparture: number; // epoch ms
  checkedInAt: number; // epoch ms
}

let current: CheckIn | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((fn) => fn());
}

export function getCheckIn(): CheckIn | null {
  return current;
}

export function setCheckIn(next: CheckIn): void {
  current = next;
  emit();
}

export function clearCheckIn(): void {
  if (current) {
    current = null;
    emit();
  }
}

export function subscribeCheckIn(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
