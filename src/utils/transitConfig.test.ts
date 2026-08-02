/**
 * Sanity checks for the TRAVEL_TIMES / TRANSIT_ROUTE_MAP shared config.
 * Both useRecommendation and planEstimate rely on these staying consistent —
 * a TRANSIT_ROUTE_MAP entry with no corresponding non-null TRAVEL_TIMES
 * config would silently break the "unavailable" gating in computePlanEstimate.
 */
import { TRAVEL_TIMES, TRANSIT_ROUTE_MAP } from './transitConfig';
import { ROUTES } from './constants';

describe('transitConfig', () => {
  test('TRAVEL_TIMES has an entry for every route', () => {
    expect(Object.keys(TRAVEL_TIMES).sort()).toEqual(Object.keys(ROUTES).sort());
  });

  test('every TRANSIT_ROUTE_MAP (route, vehicle) entry has a matching non-null TRAVEL_TIMES config', () => {
    for (const [route, vehicles] of Object.entries(TRANSIT_ROUTE_MAP)) {
      for (const vehicle of Object.keys(vehicles ?? {})) {
        const config = TRAVEL_TIMES[route as keyof typeof TRAVEL_TIMES][vehicle as 'bike' | 'car'];
        expect(config).not.toBeNull();
      }
    }
  });

  test('TRAVEL_TIMES travel/buffer minutes are non-negative when configured', () => {
    for (const modes of Object.values(TRAVEL_TIMES)) {
      for (const config of Object.values(modes)) {
        if (config === null) continue;
        expect(config.travel).toBeGreaterThanOrEqual(0);
        expect(config.buffer).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
