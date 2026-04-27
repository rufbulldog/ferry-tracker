import { TransitRecord } from '../types/storage';

export type TypicalMethod = 'raw' | 'median' | 'trimmed-mean';

export interface TypicalTransit {
  seconds: number;
  method: TypicalMethod;
  sampleSize: number;
}

// Returns a robust "typical" transit time in seconds.
// N=1: the lone value. N=2-4: median. N>=5: 20% trimmed mean (drops top and bottom 20%, averages the middle 60%).
// Returns null when there are no records.
export function computeTypicalTransitSeconds(
  records: Pick<TransitRecord, 'durationSeconds'>[]
): TypicalTransit | null {
  if (records.length === 0) return null;

  const sorted = records.map(r => r.durationSeconds).sort((a, b) => a - b);
  const n = sorted.length;

  if (n === 1) {
    return { seconds: sorted[0], method: 'raw', sampleSize: 1 };
  }

  if (n < 5) {
    const mid = Math.floor(n / 2);
    const median = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    return { seconds: median, method: 'median', sampleSize: n };
  }

  const trim = Math.floor(n * 0.2);
  const middle = sorted.slice(trim, n - trim);
  const mean = middle.reduce((sum, v) => sum + v, 0) / middle.length;
  return { seconds: mean, method: 'trimmed-mean', sampleSize: n };
}
