import { useQuery } from '@tanstack/react-query';
import { getTodayTrends, getRecentTrends } from '../api/backend';
import { DepartureSnapshot } from '../types/storage';
import { Route } from '../utils/constants';

// Hook to get today's trends for a route
export function useTodayTrends(route: Route) {
  return useQuery({
    queryKey: ['dailyTrends', route],
    queryFn: () => getTodayTrends(route),
    staleTime: 30_000, // 30 seconds
  });
}

// Hook to get recent trends (last N days) for a route
export function useRecentTrends(route: Route, days: number = 7) {
  return useQuery({
    queryKey: ['recentTrends', route, days],
    queryFn: () => getRecentTrends(route, days),
    staleTime: 60_000, // 1 minute
  });
}

// Calculate average delay for a day's snapshots
export function calculateAverageDelay(snapshots: DepartureSnapshot[]): number {
  if (snapshots.length === 0) return 0;
  const total = snapshots.reduce((sum, s) => sum + s.delayMinutes, 0);
  return Math.round(total / snapshots.length);
}

// Calculate average capacity for a day's snapshots
export function calculateAverageCapacity(snapshots: DepartureSnapshot[]): number {
  if (snapshots.length === 0) return 0;
  const total = snapshots.reduce((sum, s) => sum + s.capacityPercent, 0);
  return Math.round(total / snapshots.length);
}

// Get hourly breakdown of delays for chart
export function getHourlyDelays(snapshots: DepartureSnapshot[]): { hour: number; delay: number }[] {
  const hourlyData: Map<number, number[]> = new Map();

  snapshots.forEach(snapshot => {
    const hour = new Date(snapshot.scheduledTime).getHours();
    if (!hourlyData.has(hour)) {
      hourlyData.set(hour, []);
    }
    hourlyData.get(hour)!.push(snapshot.delayMinutes);
  });

  const result: { hour: number; delay: number }[] = [];
  hourlyData.forEach((delays, hour) => {
    const avg = delays.reduce((a, b) => a + b, 0) / delays.length;
    result.push({ hour, delay: Math.round(avg) });
  });

  return result.sort((a, b) => a.hour - b.hour);
}

// Get departure capacity data for bar chart
export function getDepartureCapacities(snapshots: DepartureSnapshot[]): { time: string; capacity: number }[] {
  return snapshots
    .map(s => ({
      time: new Date(s.scheduledTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      capacity: s.capacityPercent,
    }))
    .sort((a, b) => {
      const timeA = new Date(`2000-01-01 ${a.time}`).getTime();
      const timeB = new Date(`2000-01-01 ${b.time}`).getTime();
      return timeA - timeB;
    });
}
