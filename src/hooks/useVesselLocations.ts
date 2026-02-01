import { useQuery } from '@tanstack/react-query';
import { fetchVesselLocations } from '../api/vessels';

export function useVesselLocations() {
  return useQuery({
    queryKey: ['vesselLocations'],
    queryFn: fetchVesselLocations,
    refetchInterval: 10_000, // Poll every 10 seconds
    staleTime: 5_000,
  });
}
