import { vesselsApi } from './client';
import type { VesselLocation } from './types';

export async function fetchVesselLocations(): Promise<VesselLocation[]> {
  const { data } = await vesselsApi.get<VesselLocation[]>('/vessels');
  return data;
}
