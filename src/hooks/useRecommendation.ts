import { useMemo } from 'react';
import { useNextDepartures, DepartureInfo } from './useNextDepartures';
import { Route, FERRY_CROSSING_MINUTES, FERRY_TO_HOME_FALLBACK_MINUTES } from '../utils/constants';
import { Vehicle, TransitRoute } from '../types/storage';
import { addMinutes, formatTime } from '../utils/time';
import { useTransitRecords } from './useTransitRecords';
import { useTerminalBulletins } from './useTerminalBulletins';
import { useCarWait } from './useCarWait';
import { computeTypicalTransitSeconds } from '../utils/transitStats';
import { effectiveFerryDeparture } from '../utils/ferryDeparture';
import { CarWaitEstimate } from '../utils/carWait';

interface RecommendationResult {
  leaveByTime: Date | null;
  nextDeparture: DepartureInfo | null;
  transitMinutes: number;
  bufferMinutes: number;
  capacityPercent: number | null;
  reasoning: string[];
  // Ferry's own effective departure (what bikes/walk-ons board).
  ferryDepartureTime: Date | null;
  ferryDelayMinutes: number;
  // Car-overflow: extra wait + the sailing a driver can actually board.
  carWait: CarWaitEstimate | null;
  boardableDepartureTime: Date | null;
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

// Extra buffer added when there's an active delay alert
const DELAY_ALERT_BUFFER_MINUTES = 5;

// When we have enough recorded trips to use a robust statistic, the static
// buffer is mostly redundant — keep just a 1-min floor as a safety margin.
const RECORDED_DATA_MIN_SAMPLES = 5;
const RECORDED_BUFFER_FLOOR_MINUTES = 1;

export function useRecommendation(
  ferryRoute: Route,
  vehicle: Vehicle
): RecommendationResult {
  const { data: departures } = useNextDepartures(ferryRoute);
  const { data: transitRecords } = useTransitRecords();
  const { activeAlert } = useTerminalBulletins(ferryRoute);
  const carWaitResult = useCarWait(ferryRoute);

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
        ferryDepartureTime: null,
        ferryDelayMinutes: 0,
        carWait: null,
        boardableDepartureTime: null,
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

    const ferryEffective = effectiveFerryDeparture(nextDeparture);

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
        ferryDepartureTime: ferryEffective.time,
        ferryDelayMinutes: ferryEffective.delayMinutes,
        carWait: null,
        boardableDepartureTime: null,
        etaTime: null,
        etaMessage: null,
      };
    }

    // Look up recorded transit time using a robust "typical" stat
    const mappedTransitRoute = TRANSIT_ROUTE_MAP[ferryRoute]?.[vehicle];
    let transitMinutes = config.travel;
    let bufferMinutes = config.buffer;
    let typicalMethod: 'raw' | 'median' | 'trimmed-mean' | null = null;
    let recordCount = 0;

    if (mappedTransitRoute && transitRecords && transitRecords.length > 0) {
      const matching = transitRecords.filter(
        r => r.route === mappedTransitRoute && r.vehicle === vehicle
      );
      const typical = computeTypicalTransitSeconds(matching);
      if (typical) {
        transitMinutes = Math.ceil(typical.seconds / 60);
        typicalMethod = typical.method;
        recordCount = typical.sampleSize;
        if (recordCount >= RECORDED_DATA_MIN_SAMPLES) {
          bufferMinutes = RECORDED_BUFFER_FLOOR_MINUTES;
        }
      }
    }

    const modeLabel = vehicle === 'bike' ? 'Bike' : 'Car';
    if (typicalMethod) {
      const methodLabel =
        typicalMethod === 'trimmed-mean' ? 'trimmed mean' :
        typicalMethod === 'median' ? 'median' : 'recorded';
      reasoning.push(
        `${modeLabel} travel: ${transitMinutes} min (${methodLabel} of ${recordCount} trip${recordCount !== 1 ? 's' : ''}) + ${bufferMinutes} min buffer`
      );
    } else {
      reasoning.push(`${modeLabel} travel: ${transitMinutes} min (default) + ${bufferMinutes} min buffer`);
    }

    // Factor in delay alerts
    if (activeAlert) {
      bufferMinutes += DELAY_ALERT_BUFFER_MINUTES;
      reasoning.push(`Service delay alert: +${DELAY_ALERT_BUFFER_MINUTES} min buffer`);
    }

    if (ferryEffective.isDelayed) {
      reasoning.push(`Ferry running ~${ferryEffective.delayMinutes} min behind schedule`);
    }

    // Cars can be bumped to a later sailing when a boat fills up. Walk-ons/bikes
    // board the ferry's own departure; drivers must target the boardable one.
    const carWait = carWaitResult.estimate;
    const isCar = vehicle === 'car';
    let departureTime = ferryEffective.time;

    if (isCar && carWait.note) {
      reasoning.push(`Car wait: ${carWait.note}`);
    }
    if (isCar && carWait.extraSailings > 0 && carWaitResult.boardableDepartureTime) {
      departureTime = carWaitResult.boardableDepartureTime;
      reasoning.push(
        `Plan for the ${formatTime(carWaitResult.boardableDepartureTime)} sailing — this one is likely full for cars`,
      );
    }

    // Calculate leave-by time
    const totalLeadTime = transitMinutes + bufferMinutes;
    const leaveByTime = addMinutes(departureTime, -totalLeadTime);

    // Calculate ETA for seattle-bainbridge route
    let etaTime: Date | null = null;
    let etaMessage: string | null = null;

    if (ferryRoute === 'seattle-bainbridge') {
      let ferryToHomeMinutes = FERRY_TO_HOME_FALLBACK_MINUTES;
      if (transitRecords && transitRecords.length > 0) {
        const homeRecords = transitRecords.filter(
          r => r.route === 'ferry-to-home' && r.vehicle === 'bike'
        );
        const typical = computeTypicalTransitSeconds(homeRecords);
        if (typical) {
          ferryToHomeMinutes = Math.ceil(typical.seconds / 60);
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
      ferryDepartureTime: ferryEffective.time,
      ferryDelayMinutes: ferryEffective.delayMinutes,
      carWait,
      boardableDepartureTime: carWaitResult.boardableDepartureTime,
      etaTime,
      etaMessage,
    };
  }, [departures, ferryRoute, vehicle, transitRecords, activeAlert, carWaitResult]);
}
