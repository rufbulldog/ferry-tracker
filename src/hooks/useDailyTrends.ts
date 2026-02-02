import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDailyTrends,
  saveDepartureSnapshot,
  getRecentTrends,
  cleanupOldTrends,
  generateId,
} from '../services/storage';
import { DepartureSnapshot, DailyTrends } from '../types/storage';
import { useNextDepartures, DepartureInfo } from './useNextDepartures';
import { Route } from '../utils/constants';

// Get today's date string
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// Hook to get today's trends
export function useTodayTrends() {
  const today = getToday();

  return useQuery({
    queryKey: ['dailyTrends', today],
    queryFn: () => getDailyTrends(today),
    staleTime: 30_000, // 30 seconds
  });
}

// Hook to get recent trends (last N days)
export function useRecentTrends(days: number = 7) {
  return useQuery({
    queryKey: ['recentTrends', days],
    queryFn: () => getRecentTrends(days),
    staleTime: 60_000, // 1 minute
  });
}

// Hook to collect departure snapshots as ferries depart
export function useTrendCollector(route: Route) {
  const { data: departures } = useNextDepartures(route);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!departures) return;

    // Find departures that have just departed and need to be recorded
    const departedSailings = departures.filter(
      dep => dep.status === 'departed' && dep.actualDeparture
    );

    departedSailings.forEach(async (departure) => {
      const capacityPercent = departure.maxSpaces > 0
        ? Math.round(((departure.maxSpaces - (departure.driveUpSpaces || 0)) / departure.maxSpaces) * 100)
        : 0;

      const snapshot: DepartureSnapshot = {
        id: generateId(),
        scheduledTime: departure.scheduledDeparture.toISOString(),
        actualTime: departure.actualDeparture?.toISOString() || null,
        delayMinutes: departure.delayMinutes,
        capacityPercent,
        route,
        timestamp: new Date().toISOString(),
      };

      try {
        await saveDepartureSnapshot(snapshot);
        // Invalidate the trends query to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['dailyTrends'] });
      } catch (error) {
        console.error('Failed to save departure snapshot:', error);
      }
    });
  }, [departures, route, queryClient]);
}

// Hook to clean up old trend data on app start
export function useTrendCleanup() {
  useEffect(() => {
    cleanupOldTrends(7); // Keep last 7 days
  }, []);
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
