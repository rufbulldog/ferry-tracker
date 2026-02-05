import { useQuery } from '@tanstack/react-query';
import { getLatestDepartures } from '../api/backend';
import { DepartureSnapshot } from '../types/storage';
import { Route } from '../utils/constants';

// Hook to get the most recent departure for a route (from backend)
// This provides capacity data even if WSF API no longer has it
export function useLatestDeparture(route: Route) {
  return useQuery({
    queryKey: ['latestDeparture', route],
    queryFn: () => getLatestDepartures(route, 1),
    staleTime: 30_000, // 30 seconds - refresh frequently for real-time feel
    refetchInterval: 30_000, // Poll every 30 seconds
    select: (data: DepartureSnapshot[]) => data[0] || null,
  });
}

// Hook to get the latest departures for both directions of a route pair
// Useful for showing incoming vessel capacity (departed from opposite terminal)
export function useLatestDeparturePair(route: Route) {
  // Get the opposite route
  const oppositeRoute = getOppositeRoute(route);

  const currentRoute = useQuery({
    queryKey: ['latestDeparture', route],
    queryFn: () => getLatestDepartures(route, 1),
    staleTime: 30_000,
    refetchInterval: 30_000,
    select: (data: DepartureSnapshot[]) => data[0] || null,
  });

  const oppositeRouteQuery = useQuery({
    queryKey: ['latestDeparture', oppositeRoute],
    queryFn: () => getLatestDepartures(oppositeRoute, 1),
    staleTime: 30_000,
    refetchInterval: 30_000,
    select: (data: DepartureSnapshot[]) => data[0] || null,
  });

  return {
    // Latest departure from our terminal
    latestDeparture: currentRoute.data,
    // Latest departure from opposite terminal (incoming vessel)
    latestIncoming: oppositeRouteQuery.data,
    isLoading: currentRoute.isLoading || oppositeRouteQuery.isLoading,
  };
}

function getOppositeRoute(route: Route): Route {
  switch (route) {
    case 'seattle-bainbridge':
      return 'bainbridge-seattle';
    case 'bainbridge-seattle':
      return 'seattle-bainbridge';
    case 'kingston-edmonds':
      return 'edmonds-kingston';
    case 'edmonds-kingston':
      return 'kingston-edmonds';
  }
}
