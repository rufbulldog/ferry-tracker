import { useMemo } from 'react';
import { useVesselLocations } from './useVesselLocations';
import { TERMINALS } from '../utils/constants';

export function useRouteVessels() {
  const { data: vessels, ...rest } = useVesselLocations();

  const routeVessels = useMemo(() => {
    if (!vessels) return [];

    return vessels.filter(v =>
      (v.DepartingTerminalID === TERMINALS.SEATTLE &&
       v.ArrivingTerminalID === TERMINALS.BAINBRIDGE) ||
      (v.DepartingTerminalID === TERMINALS.BAINBRIDGE &&
       v.ArrivingTerminalID === TERMINALS.SEATTLE)
    );
  }, [vessels]);

  return { data: routeVessels, ...rest };
}
