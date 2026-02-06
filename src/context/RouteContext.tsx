import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Route } from '../utils/constants';

type RouteGroup = 'bainbridge' | 'kingston';
type Direction = 'outbound' | 'inbound';
type AnimationDirection = 'left' | 'right' | null;

interface RouteContextValue {
  routeGroup: RouteGroup;
  setRouteGroup: (group: RouteGroup) => void;
  direction: Direction;
  setDirection: (dir: Direction) => void;
  route: Route;
  directionLabels: { outbound: string; inbound: string };
  animationDirection: AnimationDirection;
  clearAnimation: () => void;
}

const RouteContext = createContext<RouteContextValue | null>(null);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [routeGroup, setRouteGroup] = useState<RouteGroup>('bainbridge');
  const [direction, setDirectionState] = useState<Direction>('outbound');
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>(null);

  const setDirection = useCallback((newDirection: Direction) => {
    setDirectionState(prev => {
      if (prev !== newDirection) {
        // Set animation direction based on the change
        // inbound = content slides in from right, outbound = content slides in from left
        setAnimationDirection(newDirection === 'inbound' ? 'right' : 'left');
      }
      return newDirection;
    });
  }, []);

  const clearAnimation = useCallback(() => {
    setAnimationDirection(null);
  }, []);

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
      animationDirection,
      clearAnimation,
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
