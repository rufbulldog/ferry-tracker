import { crossingMinutesForRoute, CROSSING_MINUTES_BY_ROUTE, FERRY_CROSSING_MINUTES } from './constants';

describe('crossingMinutesForRoute', () => {
  test('returns the per-route nominal crossing', () => {
    expect(crossingMinutesForRoute('seattle-bainbridge')).toBe(35);
    expect(crossingMinutesForRoute('bainbridge-seattle')).toBe(35);
    expect(crossingMinutesForRoute('kingston-edmonds')).toBe(30);
    expect(crossingMinutesForRoute('edmonds-kingston')).toBe(30);
  });

  test('every route has an entry, and each is a sane positive duration', () => {
    for (const minutes of Object.values(CROSSING_MINUTES_BY_ROUTE)) {
      expect(minutes).toBeGreaterThan(0);
      expect(minutes).toBeLessThan(FERRY_CROSSING_MINUTES * 3);
    }
  });
});
