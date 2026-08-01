import { computeTypicalForSlot } from './typicalConditions';
import { DepartureSnapshot } from '../types/storage';

const snap = (scheduledTime: string, delayMinutes: number, capacityPercent: number): DepartureSnapshot => ({
  id: scheduledTime,
  scheduledTime,
  actualTime: null,
  delayMinutes,
  capacityPercent,
  route: 'seattle-bainbridge',
  timestamp: scheduledTime,
});

describe('computeTypicalForSlot', () => {
  // Reference: Monday 2026-08-03 ~16:45 local (a weekday, hour 16).
  const ref = new Date('2026-08-03T16:45:00');

  test('empty input returns nulls', () => {
    expect(computeTypicalForSlot([], ref)).toEqual({ capacityPercent: null, delayMinutes: null, sampleSize: 0 });
    expect(computeTypicalForSlot(undefined, ref)).toEqual({ capacityPercent: null, delayMinutes: null, sampleSize: 0 });
  });

  test('matches same-weekday same-hour snapshots', () => {
    const data = [
      snap('2026-07-27T16:30:00', 3, 90), // prev Monday, hour 16
      snap('2026-07-20T17:10:00', 5, 96), // Monday, hour 17 (within ±1)
      snap('2026-07-13T16:50:00', 1, 88), // Monday, hour 16
    ];
    const r = computeTypicalForSlot(data, ref);
    expect(r.sampleSize).toBe(3);
    expect(r.capacityPercent).toBeGreaterThan(85);
    expect(r.delayMinutes).toBeGreaterThanOrEqual(1);
  });

  test('excludes weekend snapshots when ref is a weekday', () => {
    const data = [
      snap('2026-08-01T16:30:00', 20, 100), // Saturday — excluded
      snap('2026-08-02T16:30:00', 20, 100), // Sunday — excluded
    ];
    expect(computeTypicalForSlot(data, ref).sampleSize).toBe(0);
  });

  test('excludes snapshots outside the hour window', () => {
    const data = [
      snap('2026-07-27T12:00:00', 0, 50), // hour 12 — excluded (>1 from 16)
      snap('2026-07-27T16:00:00', 2, 80), // hour 16 — included
    ];
    const r = computeTypicalForSlot(data, ref);
    expect(r.sampleSize).toBe(1);
    expect(r.capacityPercent).toBe(80);
  });

  test('capacity ignores zeros (no-data) but delay does not', () => {
    const data = [
      snap('2026-07-27T16:30:00', 4, 0), // capacity unknown
      snap('2026-07-20T16:30:00', 6, 90),
    ];
    const r = computeTypicalForSlot(data, ref);
    expect(r.capacityPercent).toBe(90); // only the non-zero
    expect(r.sampleSize).toBe(2);
  });

  test('trims outliers once the sample is large enough (>=10 matches)', () => {
    // 10 matching Mondays, hour 16: nine cluster around 5 min / 80% capacity,
    // one wildly delayed/full outlier. floor(10 * 0.1) = 1 trims exactly the
    // one worst value off each end, so the outlier can't skew the result.
    const dates = [
      '2026-07-27', '2026-07-20', '2026-07-13', '2026-07-06', '2026-06-29',
      '2026-06-22', '2026-06-15', '2026-06-08', '2026-06-01', '2026-05-25',
    ];
    const data = dates.map((d, i) =>
      i === 0
        ? snap(`${d}T16:30:00`, 90, 100) // the outlier: huge delay, jammed full
        : snap(`${d}T16:30:00`, 5, 80),
    );
    const r = computeTypicalForSlot(data, ref);
    expect(r.sampleSize).toBe(10);
    // Plain mean would be pulled well above 5/80; trimmed mean stays near the
    // untrimmed cluster's value.
    expect(r.delayMinutes).toBeLessThan(15);
    expect(r.capacityPercent).toBeLessThan(85);
  });
});
