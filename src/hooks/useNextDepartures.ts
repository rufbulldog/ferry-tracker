import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTerminalSailingSpace } from './useTerminalConditions';
import { useVesselLocations } from './useVesselLocations';
import { ROUTES, Route } from '../utils/constants';
import { composeRouteDepartures, hasRouteSailingSpace } from '../utils/composeDepartures';
import { fetchScheduleForDate } from '../api/schedule';

export type { DepartureInfo } from '../utils/composeDepartures';

// Local calendar date `days` from now, as WSF's YYYY-MM-DD.
function tripDate(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA');
}

/**
 * Today's + tomorrow's timetable for a route — only fetched when WSF's
 * sailing-space feed doesn't list the route (Seattle and Bremerton often aren't).
 */
function useRouteTimetable(from: number, to: number, needed: boolean) {
  return useQuery({
    queryKey: ['routeTimetable', from, to, tripDate(0)],
    queryFn: async () => {
      const days = await Promise.all([0, 1].map((d) => fetchScheduleForDate(tripDate(d), from, to)));
      return days.flatMap((d) => d.TerminalCombos?.[0]?.Times ?? []);
    },
    enabled: needed,
    staleTime: 30 * 60 * 1000,
  });
}

export function useNextDepartures(route: Route) {
  const { from, to } = ROUTES[route];
  const { data: allVessels, isLoading: vesselsLoading, isFetching: vesselsFetching, error: vesselsError } = useVesselLocations();
  const { data: terminals, isLoading: terminalsLoading, isFetching: terminalsFetching, error: terminalsError } = useTerminalSailingSpace();
  const needsTimetable = !!terminals && !hasRouteSailingSpace(terminals, from, to);
  const { data: timetable, isLoading: timetableLoading } = useRouteTimetable(from, to, needsTimetable);

  // Recomputed (and the wall clock re-read) each time the data refetches.
  const departures = useMemo(
    () => composeRouteDepartures(from, to, allVessels, terminals, timetable),
    [allVessels, terminals, timetable, from, to],
  );

  return {
    data: departures,
    isLoading: vesselsLoading || terminalsLoading || (needsTimetable && timetableLoading),
    isFetching: vesselsFetching || terminalsFetching,
    error: vesselsError || terminalsError,
  };
}
