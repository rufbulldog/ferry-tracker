import {
  TIMER_LEGS,
  currentPeriod,
  formatClock,
  formatMinSec,
  legStats,
  paceAgainstTypical,
  recordLabel,
  sailingOnPaceFor,
} from './timerLegs';
import { getTimerRouteDefault } from './locations';
import { TransitRecord } from '../types/storage';

const rec = (id: string, route: TransitRecord['route'], vehicle: TransitRecord['vehicle'], durationSeconds: number, timestamp: string): TransitRecord => ({
  id, route, vehicle, durationSeconds, timestamp,
});

describe('legStats', () => {
  const records = [
    rec('a', 'home-to-ferry', 'bike', 460, '2026-10-27T07:30:00Z'),
    rec('b', 'home-to-ferry', 'bike', 480, '2026-10-29T07:30:00Z'),
    rec('c', 'home-to-ferry', 'bike', 470, '2026-10-28T07:30:00Z'),
    rec('d', 'home-to-ferry', 'car', 300, '2026-10-30T07:30:00Z'),
  ];

  test('typical, ride count and latest ride for one leg + vehicle', () => {
    const s = legStats(records, 'home-to-ferry', 'bike');
    expect(s.typicalSeconds).toBe(470); // median of 3
    expect(s.rides).toBe(3);
    expect(s.last?.id).toBe('b');
  });

  test('no rides', () => {
    expect(legStats(records, 'ferry-to-work', 'bike')).toEqual({ typicalSeconds: null, rides: 0, last: null });
    expect(legStats(undefined, 'ferry-to-work', 'bike').rides).toBe(0);
  });
});

describe('paceAgainstTypical', () => {
  test('share of typical and time left', () => {
    expect(paceAgainstTypical(240, 480)).toEqual({ percent: 50, remainingSeconds: 240 });
  });
  test('caps at 100% and goes negative once over', () => {
    expect(paceAgainstTypical(540, 480)).toEqual({ percent: 100, remainingSeconds: -60 });
  });
});

describe('sailingOnPaceFor', () => {
  const now = new Date('2026-10-30T07:40:00');
  const deps = [new Date('2026-10-30T07:05:00'), new Date('2026-10-30T08:45:00'), new Date('2026-10-30T07:55:00')];

  test('first departure after the projected arrival', () => {
    const r = sailingOnPaceFor(deps, 9 * 60, now); // arrive 7:49
    expect(r?.departure).toEqual(new Date('2026-10-30T07:55:00'));
    expect(r?.spareMinutes).toBe(6);
  });

  test('over typical projects arrival as now', () => {
    const r = sailingOnPaceFor(deps, -120, now);
    expect(r?.arrive).toEqual(now);
    expect(r?.spareMinutes).toBe(15);
  });

  test('null when no later sailing', () => {
    expect(sailingOnPaceFor(deps, 2 * 3600, now)).toBeNull();
  });
});

describe('labels and periods', () => {
  test('car home→ferry is not attributed to one terminal', () => {
    expect(recordLabel('home-to-ferry', 'car')).toBe('Home → ferry');
    expect(recordLabel('home-to-ferry', 'bike')).toBe('Home → Bainbridge ferry');
  });

  test('GPS defaults map to real legs', () => {
    for (const loc of ['home', 'bi-terminal', 'seattle-terminal', 'work']) {
      const id = getTimerRouteDefault(loc);
      expect(TIMER_LEGS.some((l) => l.id === id)).toBe(true);
    }
  });

  test('morning before noon', () => {
    expect(currentPeriod(new Date('2026-10-30T11:59:00'))).toBe('morning');
    expect(currentPeriod(new Date('2026-10-30T12:00:00'))).toBe('evening');
  });

  test('formatClock', () => {
    expect(formatClock(465)).toBe('7:45');
    expect(formatClock(5)).toBe('0:05');
    expect(formatClock(3730)).toBe('1:02:10');
  });

  test('formatMinSec', () => {
    expect(formatMinSec(503)).toBe('8m 23s');
    expect(formatMinSec(840)).toBe('14m 0s');
    expect(formatMinSec(3730)).toBe('1h 2m');
  });
});
