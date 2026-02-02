import { Platform } from 'react-native';
import { vesselsApi } from './client';
import type { VesselLocation } from './types';

export async function fetchVesselLocations(): Promise<VesselLocation[]> {
  // Web uses proxy with different path
  const path = Platform.OS === 'web' ? '/vessels' : '/vessellocations';
  const { data } = await vesselsApi.get<VesselLocation[]>(path);
  return data;
}
