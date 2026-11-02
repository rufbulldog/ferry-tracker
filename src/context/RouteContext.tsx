import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Route } from '../utils/constants';
import {
  ROUTE_GROUPS,
  RouteGroup,
  Direction,
  DEFAULT_ENABLED_ROUTE_GROUPS,
  normalizeEnabledGroups,
  routeFor,
} from '../utils/routeGroups';

type AnimationDirection = 'left' | 'right' | null;

// Which route groups the app uses (Settings). Disabled groups are hidden from
// the picker and ignored by GPS defaults and "Best from here".
const ENABLED_GROUPS_KEY = '@ferry/enabled-route-groups';

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
  enabledGroups: RouteGroup[];
  setGroupEnabled: (group: RouteGroup, enabled: boolean) => void;
}

const RouteContext = createContext<RouteContextValue | null>(null);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [selectedGroup, setRouteGroupState] = useState<RouteGroup>('bainbridge');
  const [direction, setDirectionState] = useState<Direction>('outbound');
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>(null);
  const [enabledGroups, setEnabledGroups] = useState<RouteGroup[]>(DEFAULT_ENABLED_ROUTE_GROUPS);
  const userHasSelected = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(ENABLED_GROUPS_KEY)
      .then((raw) => {
        if (raw) setEnabledGroups(normalizeEnabledGroups(JSON.parse(raw)));
      })
      .catch(() => {});
  }, []);

  const setGroupEnabled = useCallback((group: RouteGroup, enabled: boolean) => {
    setEnabledGroups((prev) => {
      // Keep at least one group: refuse to turn off the last.
      if (!enabled && prev.length === 1 && prev[0] === group) return prev;
      const next = normalizeEnabledGroups(
        enabled ? [...prev, group] : prev.filter((g) => g !== group),
      );
      AsyncStorage.setItem(ENABLED_GROUPS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

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

  // A group switched off in Settings can't stay on screen.
  const activeGroup = enabledGroups.includes(selectedGroup) ? selectedGroup : enabledGroups[0];
  const route = routeFor(activeGroup, direction);
  const info = ROUTE_GROUPS[activeGroup];
  const directionLabels = { outbound: info.outboundLabel, inbound: info.inboundLabel };

  return (
    <RouteContext.Provider value={{
      routeGroup: activeGroup,
      setRouteGroup,
      direction,
      setDirection,
      route,
      directionLabels,
      animationDirection,
      clearAnimation,
      setLocationDefaults,
      enabledGroups,
      setGroupEnabled,
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
  bainbridge: ROUTE_GROUPS.bainbridge.label,
  kingston: ROUTE_GROUPS.kingston.label,
  bremerton: ROUTE_GROUPS.bremerton.label,
};
