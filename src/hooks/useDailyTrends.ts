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

// Calculate average capacity for a day's snapshots (excluding zeros which mean no data)
export function calculateAverageCapacity(snapshots: DepartureSnapshot[]): number {
  const validSnapshots = snapshots.filter(s => s.capacityPercent > 0);
  if (validSnapshots.length === 0) return 0;
  const total = validSnapshots.reduce((sum, s) => sum + s.capacityPercent, 0);
  return Math.round(total / validSnapshots.length);
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

// Get departure capacity data for bar chart (individual departures, excluding zeros)
export function getDepartureCapacities(snapshots: DepartureSnapshot[]): { time: string; capacity: number }[] {
  return snapshots
    .filter(s => s.capacityPercent > 0) // Exclude zeros (no data recorded)
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

// Get hourly breakdown of capacity for chart (same scale as delays)
export function getHourlyCapacities(snapshots: DepartureSnapshot[]): { hour: number; capacity: number }[] {
  const hourlyData: Map<number, number[]> = new Map();

  // Only include snapshots with valid capacity data (exclude zeros which mean no data)
  snapshots.filter(s => s.capacityPercent > 0).forEach(snapshot => {
    const hour = new Date(snapshot.scheduledTime).getHours();
    if (!hourlyData.has(hour)) {
      hourlyData.set(hour, []);
    }
    hourlyData.get(hour)!.push(snapshot.capacityPercent);
  });

  const result: { hour: number; capacity: number }[] = [];
  hourlyData.forEach((capacities, hour) => {
    const avg = capacities.reduce((a, b) => a + b, 0) / capacities.length;
    result.push({ hour, capacity: Math.round(avg) });
  });

  return result.sort((a, b) => a.hour - b.hour);
}

// Get daily breakdown of delays for week/month charts
export function getDailyDelays(snapshots: DepartureSnapshot[]): { date: string; delay: number; dayOfWeek: number }[] {
  const dailyData: Map<string, number[]> = new Map();

  // Filter out zero delays (no data) and group by date
  snapshots.filter(s => s.delayMinutes !== 0 || s.capacityPercent > 0).forEach(snapshot => {
    const date = new Date(snapshot.scheduledTime);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    if (!dailyData.has(dateKey)) {
      dailyData.set(dateKey, []);
    }
    dailyData.get(dateKey)!.push(snapshot.delayMinutes);
  });

  const result: { date: string; delay: number; dayOfWeek: number }[] = [];
  dailyData.forEach((delays, dateKey) => {
    const avg = delays.reduce((a, b) => a + b, 0) / delays.length;
    const date = new Date(dateKey);
    result.push({
      date: dateKey,
      delay: Math.round(avg),
      dayOfWeek: date.getDay()
    });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}
