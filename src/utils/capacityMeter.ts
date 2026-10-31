/**
 * Capacity → meter state for the Next Sailing card's car meter: how full the
 * car deck is, how many bars light up, and the plain-language verdict.
 */

export type CapacityTone = 'room' | 'filling' | 'nearlyFull';

export const METER_BARS = 40;

const FILLING_AT = 50;
const NEARLY_FULL_AT = 85;

export function capacityTone(percentFull: number): CapacityTone {
  if (percentFull >= NEARLY_FULL_AT) return 'nearlyFull';
  if (percentFull >= FILLING_AT) return 'filling';
  return 'room';
}

export const CAPACITY_TONE_LABEL: Record<CapacityTone, string> = {
  room: 'Plenty of room',
  filling: 'Filling up',
  nearlyFull: 'Nearly full',
};

/** Percent of drive-up space taken, 0–100, or null when space data is missing. */
export function percentFull(driveUpSpaces: number | null, maxSpaces: number): number | null {
  if (driveUpSpaces === null || maxSpaces <= 0) return null;
  const taken = Math.max(0, Math.min(maxSpaces, maxSpaces - driveUpSpaces));
  return (taken / maxSpaces) * 100;
}

/** Lit bars for a fill level. Any cars aboard light at least one bar. */
export function filledBars(percent: number, bars: number = METER_BARS): number {
  if (percent <= 0) return 0;
  return Math.min(bars, Math.max(1, Math.round((percent / 100) * bars)));
}

/** Cars represented by one bar, for the meter's legend. */
export function carsPerBar(maxSpaces: number, bars: number = METER_BARS): number {
  return Math.max(1, Math.round(maxSpaces / bars));
}
