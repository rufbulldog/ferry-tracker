import {
  ALL_ROUTE_GROUPS,
  normalizeEnabledGroups,
  oppositeRoute,
  routeFor,
  selectionFor,
} from './routeGroups';
import { ROUTES, Route } from './constants';

describe('route groups', () => {
  test('every route belongs to exactly one group + direction', () => {
    for (const route of Object.keys(ROUTES) as Route[]) {
      const { group, direction } = selectionFor(route);
      expect(routeFor(group, direction)).toBe(route);
    }
  });

  test('outbound leaves from the west side', () => {
    expect(routeFor('bremerton', 'outbound')).toBe('bremerton-seattle');
    expect(routeFor('bremerton', 'inbound')).toBe('seattle-bremerton');
  });

  test('oppositeRoute flips direction', () => {
    expect(oppositeRoute('seattle-bremerton')).toBe('bremerton-seattle');
    expect(oppositeRoute('kingston-edmonds')).toBe('edmonds-kingston');
  });
});

describe('normalizeEnabledGroups', () => {
  test('keeps known groups in display order', () => {
    expect(normalizeEnabledGroups(['bremerton', 'nope', 'bainbridge'])).toEqual(['bainbridge', 'bremerton']);
  });

  test('falls back to the defaults when empty or unreadable', () => {
    expect(normalizeEnabledGroups([])).toEqual(['bainbridge', 'kingston']);
    expect(normalizeEnabledGroups(null)).toEqual(['bainbridge', 'kingston']);
  });

  test('display order covers every group', () => {
    expect(new Set(ALL_ROUTE_GROUPS).size).toBe(3);
  });
});
