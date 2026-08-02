import { useQuery } from '@tanstack/react-query';
import { fetchScheduleForDate, fetchValidDateRange } from '../api/schedule';
import { ROUTES, Route } from '../utils/constants';
import { parseDate } from '../utils/time';

export interface PlannedSailing {
  departingTime: Date;
  vesselName: string;
  vesselId: number;
}

/**
 * Full sailing list for a route on a given date (YYYY-MM-DD). Schedules are
 * effectively static, so cache generously.
 */
export function useFutureSchedule(route: Route, tripDate: string) {
  const { from, to } = ROUTES[route];
  return useQuery({
    queryKey: ['futureSchedule', tripDate, from, to],
    queryFn: () => fetchScheduleForDate(tripDate, from, to),
    staleTime: 60 * 60 * 1000, // 1 hour
    select: (data): PlannedSailing[] => {
      const combo = data.TerminalCombos?.[0];
      return (combo?.Times ?? [])
        .map((t) => {
          const departingTime = parseDate(t.DepartingTime);
          return departingTime
            ? { departingTime, vesselName: t.VesselName, vesselId: t.VesselID }
            : null;
        })
        .filter((s): s is PlannedSailing => s !== null)
        .sort((a, b) => a.departingTime.getTime() - b.departingTime.getTime());
    },
  });
}

/** The date window WSF publishes schedules for, as JS Dates (null while loading). */
export function useValidDateRange() {
  const { data } = useQuery({
    queryKey: ['scheduleValidRange'],
    queryFn: fetchValidDateRange,
    staleTime: 24 * 60 * 60 * 1000, // 1 day
  });
  return {
    from: data ? parseDate(data.DateFrom) : null,
    thru: data ? parseDate(data.DateThru) : null,
  };
}
