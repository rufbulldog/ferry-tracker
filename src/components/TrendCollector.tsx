import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNextDepartures, DepartureInfo } from '../hooks/useNextDepartures';
import { saveDepartureSnapshot, generateId } from '../services/storage';
import { DepartureSnapshot } from '../types/storage';
import { Route, ROUTES } from '../utils/constants';

// Component that collects departure snapshots in the background
// This runs at the app level to capture data regardless of which tab is active

function RouteCollector({ route }: { route: Route }) {
  const { data: departures } = useNextDepartures(route);
  const queryClient = useQueryClient();

  // Track which departures we've already recorded
  const recordedDepartures = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!departures) return;

    // Find departures that have just departed and need to be recorded
    const departedSailings = departures.filter(
      dep => dep.status === 'departed' && dep.actualDeparture
    );

    departedSailings.forEach(async (departure) => {
      // Create a unique key for this departure
      const depKey = `${departure.vesselId}-${departure.scheduledDeparture.getTime()}`;

      // Skip if we've already recorded this one
      if (recordedDepartures.current.has(depKey)) {
        return;
      }

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
        recordedDepartures.current.add(depKey);
        // Invalidate the trends query to refresh the UI if on trends page
        queryClient.invalidateQueries({ queryKey: ['dailyTrends'] });
        queryClient.invalidateQueries({ queryKey: ['recentTrends'] });
        console.log(`Recorded departure: ${departure.vesselName} at ${departure.scheduledDeparture.toLocaleTimeString()}`);
      } catch (error) {
        console.error('Failed to save departure snapshot:', error);
      }
    });
  }, [departures, route, queryClient]);

  return null; // This component doesn't render anything
}

export function TrendCollector() {
  // Collect trends for all routes
  const routes = Object.keys(ROUTES) as Route[];

  return (
    <>
      {routes.map(route => (
        <RouteCollector key={route} route={route} />
      ))}
    </>
  );
}
