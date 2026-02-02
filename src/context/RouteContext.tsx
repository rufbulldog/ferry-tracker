import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Route } from '../utils/constants';

type RouteGroup = 'bainbridge' | 'kingston';
type Direction = 'outbound' | 'inbound';

interface RouteContextValue {
  routeGroup: RouteGroup;
  setRouteGroup: (group: RouteGroup) => void;
  direction: Direction;
  setDirection: (dir: Direction) => void;
  route: Route;
  directionLabels: { outbound: string; inbound: string };
}

const RouteContext = createContext<RouteContextValue | null>(null);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [routeGroup, setRouteGroup] = useState<RouteGroup>('bainbridge');
  const [direction, setDirection] = useState<Direction>('outbound');

  // Map route group + direction to actual route
  const route: Route = routeGroup === 'bainbridge'
    ? (direction === 'outbound' ? 'bainbridge-seattle' : 'seattle-bainbridge')
    : (direction === 'outbound' ? 'kingston-edmonds' : 'edmonds-kingston');

  const directionLabels = routeGroup === 'bainbridge'
    ? { outbound: 'Bainbridge', inbound: 'Seattle' }
    : { outbound: 'Kingston', inbound: 'Edmonds' };

  return (
    <RouteContext.Provider value={{
      routeGroup,
      setRouteGroup,
      direction,
      setDirection,
      route,
      directionLabels,
    }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
}

export const ROUTE_GROUP_LABELS: Record<RouteGroup, string> = {
  bainbridge: 'Bainbridge - Seattle',
  kingston: 'Kingston - Edmonds',
};
