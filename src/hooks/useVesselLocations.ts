import { useQuery } from '@tanstack/react-query';
import { fetchVesselLocations } from '../api/vessels';

export function useVesselLocations() {
  return useQuery({
    queryKey: ['vesselLocations'],
    queryFn: fetchVesselLocations,
    refetchInterval: 5_000, // Poll every 5 seconds
    staleTime: 3_000,
  });
}
