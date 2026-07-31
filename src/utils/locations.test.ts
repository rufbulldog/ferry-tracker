/**
 * Tests for src/utils/locations.ts
 *
 * Covers:
 * - haversineDistance(): known distances, zero distance
 * - findNearestLocation(): nearest-of-N selection (exercises getKnownLocations(),
 *   which pulls in the KnownLocation type re-exported from src/types/location.ts —
 *   the new leaf module this type moved into)
 * - getRouteDefaults(): all known ids + default fallback
 * - getTimerRouteDefault(): all known ids + default fallback
 *
 * No AsyncStorage mocking needed: with an empty personalLocations cache (the
 * default at module load, before loadPersonalLocations() is ever called),
 * getKnownLocations() only returns the public terminal list.
 */

import {
  haversineDistance,
  findNearestLocation,
  getRouteDefaults,
  getTimerRouteDefault,
} from './locations';

// ---------------------------------------------------------------------------
// haversineDistance
// ---------------------------------------------------------------------------

describe('haversineDistance', () => {
  test('returns 0 for identical points', () => {
    expect(haversineDistance(47.6, -122.5, 47.6, -122.5)).toBe(0);
  });

  test('returns ~111.2km for one degree of latitude apart', () => {
    const meters = haversineDistance(47.0, -122.0, 48.0, -122.0);
    expect(meters).toBeGreaterThan(111_000);
    expect(meters).toBeLessThan(111_400);
  });

  test('is symmetric regardless of point order', () => {
    const a = haversineDistance(47.6235, -122.5104, 47.6023, -122.3384);
    const b = haversineDistance(47.6023, -122.3384, 47.6235, -122.5104);
    expect(a).toBeCloseTo(b, 6);
  });
});

// ---------------------------------------------------------------------------
// findNearestLocation
// ---------------------------------------------------------------------------

describe('findNearestLocation', () => {
  test('returns the closest public terminal when no personal locations are set', () => {
    // Right on top of the Bainbridge terminal's coordinates.
    const result = findNearestLocation(47.6235, -122.5104);

    expect(result).not.toBeNull();
    expect(result?.location.id).toBe('bi-terminal');
    expect(result?.distanceMeters).toBe(0);
  });

  test('picks the nearer of two candidate terminals', () => {
    // Closer to Edmonds (47.8106, -122.3844) than Kingston (47.7964, -122.4949).
    const result = findNearestLocation(47.81, -122.39);

    expect(result?.location.id).toBe('edmonds-terminal');
  });
});

// ---------------------------------------------------------------------------
// getRouteDefaults
// ---------------------------------------------------------------------------

describe('getRouteDefaults', () => {
  test.each([
    ['home', { routeGroup: 'bainbridge', direction: 'outbound' }],
    ['bi-terminal', { routeGroup: 'bainbridge', direction: 'outbound' }],
    ['work', { routeGroup: 'bainbridge', direction: 'inbound' }],
    ['seattle-terminal', { routeGroup: 'bainbridge', direction: 'inbound' }],
    ['kingston-terminal', { routeGroup: 'kingston', direction: 'outbound' }],
    ['edmonds-terminal', { routeGroup: 'kingston', direction: 'inbound' }],
  ] as const)('maps %s to %o', (locationId, expected) => {
    expect(getRouteDefaults(locationId)).toEqual(expected);
  });

  test('falls back to bainbridge/outbound for an unknown id', () => {
    expect(getRouteDefaults('some-unknown-id')).toEqual({
      routeGroup: 'bainbridge',
      direction: 'outbound',
    });
  });
});

// ---------------------------------------------------------------------------
// getTimerRouteDefault
// ---------------------------------------------------------------------------

describe('getTimerRouteDefault', () => {
  test.each([
    ['home', 'bi-home-to-ferry'],
    ['bi-terminal', 'bi-ferry-to-home'],
    ['seattle-terminal', 'bi-ferry-to-work'],
    ['work', 'bi-work-to-ferry'],
  ] as const)('maps %s to %s', (locationId, expected) => {
    expect(getTimerRouteDefault(locationId)).toBe(expected);
  });

  test('returns null for an unknown id', () => {
    expect(getTimerRouteDefault('kingston-terminal')).toBeNull();
  });
});
