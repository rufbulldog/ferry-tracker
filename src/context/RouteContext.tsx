import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
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
  setLocationDefaults: (group: RouteGroup, dir: Direction) => void;
}

const RouteContext = createContext<RouteContextValue | null>(null);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [routeGroup, setRouteGroupState] = useState<RouteGroup>('bainbridge');
  const [direction, setDirectionState] = useState<Direction>('outbound');
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>(null);
  const userHasSelected = useRef(false);

  const setRouteGroup = useCallback((group: RouteGroup) => {
    userHasSelected.current = true;
    setRouteGroupState(group);
  }, []);

  const setDirection = useCallback((newDirection: Direction) => {
    userHasSelected.current = true;
    setDirectionState(prev => {
      if (prev !== newDirection) {
        setAnimationDirection(newDirection === 'inbound' ? 'right' : 'left');
      }
      return newDirection;
    });
  }, []);

  // Set defaults from GPS — only applies if user hasn't manually changed the selection
  const setLocationDefaults = useCallback((group: RouteGroup, dir: Direction) => {
    if (userHasSelected.current) return;
    setRouteGroupState(group);
    setDirectionState(dir);
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
      setLocationDefaults,
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
