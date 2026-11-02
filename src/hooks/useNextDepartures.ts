import { useMemo } from 'react';
import { useTerminalSailingSpace } from './useTerminalConditions';
import { useVesselLocations } from './useVesselLocations';
import { ROUTES, Route } from '../utils/constants';
import { composeDepartures } from '../utils/composeDepartures';

export type { DepartureInfo } from '../utils/composeDepartures';

export function useNextDepartures(route: Route) {
  const { data: allVessels, isLoading: vesselsLoading, isFetching: vesselsFetching, error: vesselsError } = useVesselLocations();
  const { data: terminals, isLoading: terminalsLoading, isFetching: terminalsFetching, error: terminalsError } = useTerminalSailingSpace();

  // Recomputed (and the wall clock re-read) each time the data refetches.
  const departures = useMemo(
    () => composeDepartures(ROUTES[route].from, ROUTES[route].to, allVessels, terminals),
    [allVessels, terminals, route],
  );

  return {
    data: departures,
    isLoading: vesselsLoading || terminalsLoading,
    isFetching: vesselsFetching || terminalsFetching,
    error: vesselsError || terminalsError,
  };
}
