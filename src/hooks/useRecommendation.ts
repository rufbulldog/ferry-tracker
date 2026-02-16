import { useMemo } from 'react';
import { useNextDepartures, DepartureInfo } from './useNextDepartures';
import { Route } from '../utils/constants';
import { Vehicle, TransitRoute } from '../types/storage';
import { addMinutes, formatTime } from '../utils/time';
import { useTransitRecords } from './useTransitRecords';
import { useTerminalBulletins } from './useTerminalBulletins';

interface RecommendationResult {
  leaveByTime: Date | null;
  nextDeparture: DepartureInfo | null;
  transitMinutes: number;
  bufferMinutes: number;
  capacityPercent: number | null;
  reasoning: string[];
  // ETA feature (seattle-bainbridge only)
  etaTime: Date | null;
  etaMessage: string | null;
}

// Travel times by ferry route and vehicle (static fallbacks)
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

// Map (ferry route, vehicle) → TransitRoute for looking up recorded averages
const TRANSIT_ROUTE_MAP: Partial<Record<Route, Partial<Record<Vehicle, TransitRoute>>>> = {
  'bainbridge-seattle': {
    bike: 'home-to-ferry',
    car: 'home-to-ferry',
  },
  'seattle-bainbridge': {
    bike: 'work-to-ferry',
  },
  'kingston-edmonds': {
    car: 'home-to-ferry',
  },
};

// ETA constants
export const FERRY_CROSSING_MINUTES = 35;
export const FERRY_TO_HOME_FALLBACK_MINUTES = 15;
export const ETA_CONTACT_NUMBER = 'REDACTED';

// Extra buffer added when there's an active delay alert
const DELAY_ALERT_BUFFER_MINUTES = 5;

export function useRecommendation(
  ferryRoute: Route,
  vehicle: Vehicle
): RecommendationResult {
  const { data: departures } = useNextDepartures(ferryRoute);
  const { data: transitRecords } = useTransitRecords();
  const { activeAlert } = useTerminalBulletins(ferryRoute);

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
        etaTime: null,
        etaMessage: null,
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
        etaTime: null,
        etaMessage: null,
      };
    }

    // Look up recorded average transit time
    const mappedTransitRoute = TRANSIT_ROUTE_MAP[ferryRoute]?.[vehicle];
    let transitMinutes = config.travel;
    let usingRecordedAvg = false;
    let recordCount = 0;

    if (mappedTransitRoute && transitRecords && transitRecords.length > 0) {
      const matching = transitRecords.filter(
        r => r.route === mappedTransitRoute && r.vehicle === vehicle
      );
      if (matching.length > 0) {
        const totalSeconds = matching.reduce((sum, r) => sum + r.durationSeconds, 0);
        const avgSeconds = totalSeconds / matching.length;
        transitMinutes = Math.ceil(avgSeconds / 60);
        usingRecordedAvg = true;
        recordCount = matching.length;
      }
    }

    // Start with static buffer
    let bufferMinutes = config.buffer;

    const modeLabel = vehicle === 'bike' ? 'Bike' : 'Car';
    if (usingRecordedAvg) {
      reasoning.push(`${modeLabel} travel: ${transitMinutes} min (avg of ${recordCount} trip${recordCount !== 1 ? 's' : ''}) + ${bufferMinutes} min buffer`);
    } else {
      reasoning.push(`${modeLabel} travel: ${transitMinutes} min (default) + ${bufferMinutes} min buffer`);
    }

    // Factor in delay alerts
    if (activeAlert) {
      bufferMinutes += DELAY_ALERT_BUFFER_MINUTES;
      reasoning.push(`Service delay alert: +${DELAY_ALERT_BUFFER_MINUTES} min buffer`);
    }

    // Use estimated departure if available, otherwise scheduled
    const departureTime = nextDeparture.estimatedDeparture || nextDeparture.scheduledDeparture;

    // Calculate leave-by time
    const totalLeadTime = transitMinutes + bufferMinutes;
    const leaveByTime = addMinutes(departureTime, -totalLeadTime);

    // Calculate ETA for seattle-bainbridge route
    let etaTime: Date | null = null;
    let etaMessage: string | null = null;

    if (ferryRoute === 'seattle-bainbridge') {
      // Look up ferry-to-home bike average
      let ferryToHomeMinutes = FERRY_TO_HOME_FALLBACK_MINUTES;
      if (transitRecords && transitRecords.length > 0) {
        const homeRecords = transitRecords.filter(
          r => r.route === 'ferry-to-home' && r.vehicle === 'bike'
        );
        if (homeRecords.length > 0) {
          const totalSeconds = homeRecords.reduce((sum, r) => sum + r.durationSeconds, 0);
          ferryToHomeMinutes = Math.ceil(totalSeconds / homeRecords.length / 60);
        }
      }

      const totalMinutes = FERRY_CROSSING_MINUTES + ferryToHomeMinutes;
      etaTime = addMinutes(new Date(), totalMinutes);
      etaMessage = `⛴️ Boarded, ETA: ${formatTime(etaTime)}`;
    }

    return {
      leaveByTime,
      nextDeparture,
      transitMinutes,
      bufferMinutes,
      capacityPercent,
      reasoning,
      etaTime,
      etaMessage,
    };
  }, [departures, ferryRoute, vehicle, transitRecords, activeAlert]);
}
