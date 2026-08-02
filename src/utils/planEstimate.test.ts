import { computePlanEstimate } from './planEstimate';
import { TransitRecord, DepartureSnapshot } from '../types/storage';

const rec = (route: TransitRecord['route'], vehicle: TransitRecord['vehicle'], seconds: number): TransitRecord => ({
  id: `${route}-${vehicle}-${seconds}`,
  route,
  vehicle,
  durationSeconds: seconds,
  timestamp: '2026-07-01T08:00:00Z',
});

const snap = (scheduledTime: string, delayMinutes: number, capacityPercent: number): DepartureSnapshot => ({
  id: scheduledTime,
  scheduledTime,
  actualTime: null,
  delayMinutes,
  capacityPercent,
  route: 'bainbridge-seattle',
  timestamp: scheduledTime,
});

// A future Monday 8:00 AM sailing.
const sailing = new Date('2026-08-10T08:00:00-07:00');

describe('computePlanEstimate', () => {
  test('unavailable when the vehicle mode is not used on the route', () => {
    // seattle-bainbridge has no car config.
    const e = computePlanEstimate({ sailing, route: 'seattle-bainbridge', vehicle: 'car', transitRecords: [], trends: [] });
    expect(e.available).toBe(false);
    expect(e.leaveBy).toBeNull();
  });

  test('uses the static default transit when there are no records', () => {
    const e = computePlanEstimate({ sailing, route: 'bainbridge-seattle', vehicle: 'bike', transitRecords: [], trends: [] });
    expect(e.available).toBe(true);
    expect(e.transitFromRecords).toBe(false);
    expect(e.transitMinutes).toBe(7); // TRAVEL_TIMES default for bainbridge-seattle bike
    expect(e.bufferMinutes).toBe(2);
    // leaveBy = 8:00 - (7 + 2) = 7:51
    expect(e.leaveBy!.toISOString()).toBe(new Date('2026-08-10T07:51:00-07:00').toISOString());
  });

  test('derives transit from recorded trips and drops the buffer to the floor with enough samples', () => {
    // 6 recorded home-to-ferry bike trips of ~10 min (600s).
    const records = Array.from({ length: 6 }, () => rec('home-to-ferry', 'bike', 600));
    const e = computePlanEstimate({ sailing, route: 'bainbridge-seattle', vehicle: 'bike', transitRecords: records, trends: [] });
    expect(e.transitFromRecords).toBe(true);
    expect(e.recordCount).toBe(6);
    expect(e.transitMinutes).toBe(10); // ceil(600/60)
    expect(e.bufferMinutes).toBe(1); // floor once >= 5 samples
    // leaveBy = 8:00 - 11 = 7:49
    expect(e.leaveBy!.toISOString()).toBe(new Date('2026-08-10T07:49:00-07:00').toISOString());
  });

  test('surfaces typical historical delay/capacity for the sailing slot', () => {
    // Prior Mondays around hour 8, same weekday bucket.
    const trends = [
      snap('2026-08-03T08:10:00-07:00', 4, 70),
      snap('2026-07-27T07:50:00-07:00', 6, 80),
      snap('2026-07-20T08:00:00-07:00', 5, 75),
    ];
    const e = computePlanEstimate({ sailing, route: 'bainbridge-seattle', vehicle: 'bike', transitRecords: [], trends });
    expect(e.historySampleSize).toBe(3);
    expect(e.typicalDelayMinutes).toBeGreaterThanOrEqual(4);
    expect(e.typicalCapacityPercent).toBeGreaterThan(65);
  });

  test('no history → null typical values but still a leaveBy', () => {
    const e = computePlanEstimate({ sailing, route: 'kingston-edmonds', vehicle: 'car', transitRecords: [], trends: [] });
    expect(e.available).toBe(true);
    expect(e.leaveBy).not.toBeNull();
    expect(e.typicalDelayMinutes).toBeNull();
    expect(e.typicalCapacityPercent).toBeNull();
  });
});
