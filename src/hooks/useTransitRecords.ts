import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTransitRecords,
  createTransitRecord,
  deleteTransitRecord,
} from '../api/backend';
import { TransitRecord, TransitRoute, Vehicle } from '../types/storage';

export function useTransitRecords() {
  return useQuery({
    queryKey: ['transitRecords'],
    queryFn: getTransitRecords,
    staleTime: 60_000, // Refresh every minute
  });
}

export function useSaveTransitRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (record: { route: TransitRoute; vehicle: Vehicle; durationSeconds: number }) => {
      return createTransitRecord({
        route: record.route,
        vehicle: record.vehicle,
        durationSeconds: record.durationSeconds,
      });
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

// Transit route display info
export const TRANSIT_ROUTE_INFO: Record<TransitRoute, { label: string; shortLabel: string }> = {
  'home-to-ferry': { label: 'Home → Ferry', shortLabel: 'Home→Ferry' },
  'ferry-to-work': { label: 'Ferry → Work', shortLabel: 'Ferry→Work' },
  'work-to-ferry': { label: 'Work → Ferry', shortLabel: 'Work→Ferry' },
  'ferry-to-home': { label: 'Ferry → Home', shortLabel: 'Ferry→Home' },
};

// Get all transit time averages grouped by route and vehicle
export interface TransitAverage {
  route: TransitRoute;
  vehicle: Vehicle;
  averageSeconds: number;
  count: number;
}

export function useAllTransitAverages() {
  const { data: records, isLoading } = useTransitRecords();

  if (!records || records.length === 0) {
    return { averages: [], isLoading };
  }

  // Group by route + vehicle
  const groups = new Map<string, { total: number; count: number; route: TransitRoute; vehicle: Vehicle }>();

  records.forEach(r => {
    const key = `${r.route}-${r.vehicle}`;
    const existing = groups.get(key);
    if (existing) {
      existing.total += r.durationSeconds;
      existing.count += 1;
    } else {
      groups.set(key, {
        total: r.durationSeconds,
        count: 1,
        route: r.route,
        vehicle: r.vehicle,
      });
    }
  });

  const averages: TransitAverage[] = [];
  groups.forEach(g => {
    averages.push({
      route: g.route,
      vehicle: g.vehicle,
      averageSeconds: Math.round(g.total / g.count),
      count: g.count,
    });
  });

  // Sort by route then vehicle
  const routeOrder: TransitRoute[] = ['home-to-ferry', 'ferry-to-work', 'work-to-ferry', 'ferry-to-home'];
  averages.sort((a, b) => {
    const routeDiff = routeOrder.indexOf(a.route) - routeOrder.indexOf(b.route);
    if (routeDiff !== 0) return routeDiff;
    return a.vehicle.localeCompare(b.vehicle);
  });

  return { averages, isLoading };
}
