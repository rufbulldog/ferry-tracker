import { useMemo } from 'react';
import { useNextDepartures, DepartureInfo } from './useNextDepartures';
import { Route } from '../utils/constants';
import { Vehicle } from '../types/storage';
import { addMinutes } from '../utils/time';

interface RecommendationResult {
  leaveByTime: Date | null;
  nextDeparture: DepartureInfo | null;
  transitMinutes: number;
  bufferMinutes: number;
  capacityPercent: number | null;
  reasoning: string[];
}

// Travel times by ferry route and vehicle
// null means that mode is not used for this route
const TRAVEL_TIMES: Record<Route, {
  bike: { travel: number; buffer: number } | null;
  car: { travel: number; buffer: number } | null;
}> = {
  // BI to Seattle = going to work from Bainbridge
  'bainbridge-seattle': {
    bike: { travel: 7, buffer: 2 },
    car: { travel: 5, buffer: 10 },
  },
  // Seattle to BI = going home to Bainbridge
  'seattle-bainbridge': {
    bike: { travel: 10, buffer: 2 },
    car: null, // Bikes to work, no car
  },
  // Kingston to Edmonds = going to work from Kingston area
  'kingston-edmonds': {
    bike: null, // Too far to bike
    car: { travel: 30, buffer: 20 },
  },
  // Edmonds to Kingston = going home to Kingston area
  'edmonds-kingston': {
    bike: null, // Not used
    car: null, // Not specified
  },
};

export function useRecommendation(
  ferryRoute: Route,
  vehicle: Vehicle
): RecommendationResult {
  const { data: departures } = useNextDepartures(ferryRoute);

  return useMemo(() => {
    const reasoning: string[] = [];

    // Get next non-departed, non-cancelled departure
    const nextDeparture = departures?.find(
      d => d.status !== 'departed' && !d.isCancelled
    ) || null;

    if (!nextDeparture) {
      return {
        leaveByTime: null,
        nextDeparture: null,
        transitMinutes: 0,
        bufferMinutes: 0,
        capacityPercent: null,
        reasoning: ['No upcoming departures found'],
      };
    }

    // Calculate capacity percentage
    const capacityPercent = nextDeparture.maxSpaces > 0
      ? Math.round(((nextDeparture.maxSpaces - (nextDeparture.driveUpSpaces || 0)) / nextDeparture.maxSpaces) * 100)
      : null;

    // Get travel config for this route and vehicle
    const routeConfig = TRAVEL_TIMES[ferryRoute];
    const config = routeConfig[vehicle];

    // If this vehicle mode isn't used for this route
    if (!config) {
      const modeLabel = vehicle === 'bike' ? 'Bike' : 'Car';
      reasoning.push(`${modeLabel} not configured for this route`);
      return {
        leaveByTime: null,
        nextDeparture,
        transitMinutes: 0,
        bufferMinutes: 0,
        capacityPercent,
        reasoning,
      };
    }

    const transitMinutes = config.travel;
    const bufferMinutes = config.buffer;
    const modeLabel = vehicle === 'bike' ? 'Bike' : 'Car';
    reasoning.push(`${modeLabel} travel: ${transitMinutes} min + ${bufferMinutes} min buffer`);

    // Use estimated departure if available, otherwise scheduled
    const departureTime = nextDeparture.estimatedDeparture || nextDeparture.scheduledDeparture;

    // Calculate leave-by time
    const totalLeadTime = transitMinutes + bufferMinutes;
    const leaveByTime = addMinutes(departureTime, -totalLeadTime);

    return {
      leaveByTime,
      nextDeparture,
      transitMinutes,
      bufferMinutes,
      capacityPercent,
      reasoning,
    };
  }, [departures, ferryRoute, vehicle]);
}
