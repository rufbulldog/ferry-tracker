import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTransitRecords,
  saveTransitRecord,
  deleteTransitRecord,
  generateId,
} from '../services/storage';
import { TransitRecord, TransitRoute, Vehicle } from '../types/storage';

export function useTransitRecords() {
  return useQuery({
    queryKey: ['transitRecords'],
    queryFn: getTransitRecords,
    staleTime: Infinity, // Only refresh on mutation
  });
}

export function useSaveTransitRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (record: Omit<TransitRecord, 'id' | 'timestamp'>) => {
      const fullRecord: TransitRecord = {
        ...record,
        id: generateId(),
        timestamp: new Date().toISOString(),
      };
      return saveTransitRecord(fullRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transitRecords'] });
    },
  });
}

export function useDeleteTransitRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransitRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transitRecords'] });
    },
  });
}

// Calculate average transit time for a specific route and vehicle
export function useAverageTransitTime(route: TransitRoute, vehicle: Vehicle) {
  const { data: records } = useTransitRecords();

  if (!records || records.length === 0) {
    return null;
  }

  const matching = records.filter(r => r.route === route && r.vehicle === vehicle);

  if (matching.length === 0) {
    return null;
  }

  const totalSeconds = matching.reduce((sum, r) => sum + r.durationSeconds, 0);
  return Math.round(totalSeconds / matching.length);
}

// Get recent records for display (last 10)
export function useRecentTransitRecords(limit: number = 10) {
  const { data: records, ...rest } = useTransitRecords();

  const recentRecords = records
    ? [...records]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    : [];

  return { data: recentRecords, ...rest };
}
