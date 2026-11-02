/**
 * Are you on your usual commute, or somewhere else? On the commute (near home,
 * work or a terminal) the Ferry tab's own leave-by is the answer and "Best from
 * here" is noise; away from it (a tournament in Renton, Northgate) you're almost
 * certainly driving and want the cross-route comparison.
 */
import type { KnownLocation } from '../types/location';
import { haversineDistance } from './geo';
import { AT_TERMINAL_METERS } from './bestSailing';

// Within this of saved home/work counts as being on the commute.
export const COMMUTE_RADIUS_METERS = 1000;

export function isAwayFromCommute(
  lat: number,
  lon: number,
  personal: KnownLocation[],
  terminals: KnownLocation[],
): boolean {
  const near = (locs: KnownLocation[], radius: number) =>
    locs.some((l) => haversineDistance(lat, lon, l.lat, l.lon) <= radius);
  return !near(personal, COMMUTE_RADIUS_METERS) && !near(terminals, AT_TERMINAL_METERS);
}
