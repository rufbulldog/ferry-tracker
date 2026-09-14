import { typicalCrossingMinutes } from './typicalCrossing';
import { DepartureSnapshot } from '../types/storage';

let n = 0;
const snap = (route: string, crossingMinutes: number | null | undefined): DepartureSnapshot => ({
  id: `${route}-${crossingMinutes}-${n++}`,
  scheduledTime: '2026-08-03T08:00:00-07:00',
  actualTime: '2026-08-03T08:05:00-07:00',
  delayMinutes: 5,
  capacityPercent: 70,
  route,
  timestamp: '2026-08-03T08:05:00-07:00',
  crossingMinutes,
});

describe('typicalCrossingMinutes', () => {
  test('empty / undefined → null', () => {
    expect(typicalCrossingMinutes(undefined, 'seattle-bainbridge')).toEqual({ minutes: null, sampleSize: 0 });
    expect(typicalCrossingMinutes([], 'seattle-bainbridge')).toEqual({ minutes: null, sampleSize: 0 });
  });

  test('averages non-null crossings for the route', () => {
    const trends = [
      snap('seattle-bainbridge', 34),
      snap('seattle-bainbridge', 36),
      snap('seattle-bainbridge', 35),
    ];
    const r = typicalCrossingMinutes(trends, 'seattle-bainbridge');
    expect(r.sampleSize).toBe(3);
    expect(r.minutes).toBe(35);
  });

  test('ignores null/absent crossings and other routes', () => {
    const trends = [
      snap('seattle-bainbridge', 40),
      snap('seattle-bainbridge', null),
      snap('seattle-bainbridge', undefined),
      snap('kingston-edmonds', 30), // different route
    ];
    const r = typicalCrossingMinutes(trends, 'seattle-bainbridge');
    expect(r.sampleSize).toBe(1);
    expect(r.minutes).toBe(40);
  });

  test('ignores non-positive crossings', () => {
    const trends = [
      snap('seattle-bainbridge', 0),
      snap('seattle-bainbridge', -5),
      snap('seattle-bainbridge', 35),
    ];
    const r = typicalCrossingMinutes(trends, 'seattle-bainbridge');
    expect(r.sampleSize).toBe(1);
    expect(r.minutes).toBe(35);
  });
});
