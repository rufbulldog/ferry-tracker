/**
 * Route groups — one ferry crossing, both directions. The Ferry tab picks a
 * group + direction; Settings chooses which groups the app uses at all.
 *
 * "Outbound" is always the Kitsap side heading to the city side (the original
 * Bainbridge/Kingston commute), so each group's outbound terminal is the west one.
 */
import { Route } from './constants';

export type RouteGroup = 'bainbridge' | 'kingston' | 'bremerton';
export type Direction = 'outbound' | 'inbound';

export interface RouteGroupInfo {
  label: string;
  outbound: Route;
  inbound: Route;
  /** Direction-toggle labels: the terminal you leave from. */
  outboundLabel: string;
  inboundLabel: string;
  /** Location ids (locations.ts) of each direction's departure terminal. */
  outboundTerminalId: string;
  inboundTerminalId: string;
}

export const ROUTE_GROUPS: Record<RouteGroup, RouteGroupInfo> = {
  bainbridge: {
    label: 'Bainbridge - Seattle',
    outbound: 'bainbridge-seattle',
    inbound: 'seattle-bainbridge',
    outboundLabel: 'Bainbridge',
    inboundLabel: 'Seattle',
    outboundTerminalId: 'bi-terminal',
    inboundTerminalId: 'seattle-terminal',
  },
  kingston: {
    label: 'Kingston - Edmonds',
    outbound: 'kingston-edmonds',
    inbound: 'edmonds-kingston',
    outboundLabel: 'Kingston',
    inboundLabel: 'Edmonds',
    outboundTerminalId: 'kingston-terminal',
    inboundTerminalId: 'edmonds-terminal',
  },
  bremerton: {
    label: 'Bremerton - Seattle',
    outbound: 'bremerton-seattle',
    inbound: 'seattle-bremerton',
    outboundLabel: 'Bremerton',
    inboundLabel: 'Seattle',
    outboundTerminalId: 'bremerton-terminal',
    inboundTerminalId: 'seattle-terminal',
  },
};

/** Display order in the route picker and Settings. */
export const ALL_ROUTE_GROUPS: RouteGroup[] = ['bainbridge', 'kingston', 'bremerton'];

/** Groups a fresh install uses; Bremerton is opt-in from Settings. */
export const DEFAULT_ENABLED_ROUTE_GROUPS: RouteGroup[] = ['bainbridge', 'kingston'];

export function routeFor(group: RouteGroup, direction: Direction): Route {
  return ROUTE_GROUPS[group][direction];
}

/** The group + direction a route belongs to. */
export function selectionFor(route: Route): { group: RouteGroup; direction: Direction } {
  for (const group of ALL_ROUTE_GROUPS) {
    const g = ROUTE_GROUPS[group];
    if (g.outbound === route) return { group, direction: 'outbound' };
    if (g.inbound === route) return { group, direction: 'inbound' };
  }
  throw new Error(`Route ${route} is in no route group`);
}

/** The same crossing the other way. */
export function oppositeRoute(route: Route): Route {
  const { group, direction } = selectionFor(route);
  return routeFor(group, direction === 'outbound' ? 'inbound' : 'outbound');
}

/** Keep only known groups, in display order; never empty. */
export function normalizeEnabledGroups(groups: readonly string[] | null | undefined): RouteGroup[] {
  const known = ALL_ROUTE_GROUPS.filter((g) => groups?.includes(g));
  return known.length > 0 ? known : [...DEFAULT_ENABLED_ROUTE_GROUPS];
}
