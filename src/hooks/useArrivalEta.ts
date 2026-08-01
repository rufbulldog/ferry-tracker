import { useMemo, useSyncExternalStore } from 'react';
import { useNextDepartures, DepartureInfo } from './useNextDepartures';
import { useTransitRecords } from './useTransitRecords';
import { Route, FERRY_CROSSING_MINUTES, FERRY_TO_HOME_FALLBACK_MINUTES } from '../utils/constants';
import { TransitRoute, Vehicle } from '../types/storage';
import { addMinutes } from '../utils/time';
import { computeTypicalTransitSeconds, TypicalMethod } from '../utils/transitStats';
import {
  selectActiveDeparture,
  etaDepartureBasis,
} from '../utils/arrivalEtaLogic';
import { getCheckIn, subscribeCheckIn } from '../store/checkIn';

// How long after a pinned sailing's ferry arrival we keep honoring the pin
// before treating it as stale (covers a slow walk off the boat).
const CHECKIN_GRACE_MINUTES = 20;

export type ArrivalKind = 'home' | 'office';

export interface ArrivalEta {
  kind: ArrivalKind;
  label: string; // e.g. "Home by", "At office by"
  etaTime: Date | null;
  ferryArrivalTime: Date | null;
  transitMinutes: number;
  transitMethod: TypicalMethod | 'default';
  sampleSize: number;
  vehicle: Vehicle;
  transitRoute: TransitRoute;
}

export interface ArrivalEtaResult {
  arrival: ArrivalEta | null;
  nextDeparture: DepartureInfo | null;
  supported: boolean; // false for routes we don't compute arrival for
}

// Map ferry direction to which arrival we compute and which transit segment to use
const ARRIVAL_CONFIG: Partial<Record<Route, {
  kind: ArrivalKind;
  label: string;
  transitRoute: TransitRoute;
  vehicle: Vehicle;
  fallbackMinutes: number;
}>> = {
  'seattle-bainbridge': {
    kind: 'home',
    label: 'Home by',
    transitRoute: 'ferry-to-home',
    vehicle: 'bike',
    fallbackMinutes: FERRY_TO_HOME_FALLBACK_MINUTES,
  },
  'bainbridge-seattle': {
    kind: 'office',
    label: 'At office by',
    transitRoute: 'ferry-to-work',
    vehicle: 'bike',
    fallbackMinutes: 15,
  },
};

export function useArrivalEta(ferryRoute: Route): ArrivalEtaResult {
  const { data: departures } = useNextDepartures(ferryRoute);
  const { data: transitRecords } = useTransitRecords();
  const checkIn = useSyncExternalStore(subscribeCheckIn, getCheckIn);

  return useMemo(() => {
    const config = ARRIVAL_CONFIG[ferryRoute];

    // If checked in on this route, lock onto the pinned sailing (stays put
    // through the loading→departed transition) as long as it's still findable
    // and not long past arrival. Otherwise pick the active departure normally.
    let activeDeparture: DepartureInfo | null = null;
    if (checkIn && checkIn.route === ferryRoute && departures) {
      const pinned = departures.find(
        d => d.vesselId === checkIn.vesselId &&
          Math.abs(d.scheduledDeparture.getTime() - checkIn.scheduledDeparture) < 5 * 60_000,
      );
      const arrivalCutoff = checkIn.scheduledDeparture + (FERRY_CROSSING_MINUTES + CHECKIN_GRACE_MINUTES) * 60_000;
      // Wall-clock read to expire a stale pin; recomputed each time the memo
      // re-runs on data refetch (same pattern as useNextDepartures).
      // eslint-disable-next-line react-hooks/purity
      if (pinned && Date.now() < arrivalCutoff) {
        activeDeparture = pinned;
      }
    }
    if (!activeDeparture) {
      activeDeparture = selectActiveDeparture(departures);
    }

    if (!config) {
      return { arrival: null, nextDeparture: activeDeparture, supported: false };
    }

    if (!activeDeparture) {
      return { arrival: null, nextDeparture: null, supported: true };
    }

    const departureTime = etaDepartureBasis(activeDeparture);
    const ferryArrivalTime = addMinutes(departureTime, FERRY_CROSSING_MINUTES);

    let transitMinutes = config.fallbackMinutes;
    let transitMethod: TypicalMethod | 'default' = 'default';
    let sampleSize = 0;

    if (transitRecords && transitRecords.length > 0) {
      const matching = transitRecords.filter(
        r => r.route === config.transitRoute && r.vehicle === config.vehicle
      );
      const typical = computeTypicalTransitSeconds(matching);
      if (typical) {
        transitMinutes = Math.ceil(typical.seconds / 60);
        transitMethod = typical.method;
        sampleSize = typical.sampleSize;
      }
    }

    const etaTime = addMinutes(ferryArrivalTime, transitMinutes);

    return {
      arrival: {
        kind: config.kind,
        label: config.label,
        etaTime,
        ferryArrivalTime,
        transitMinutes,
        transitMethod,
        sampleSize,
        vehicle: config.vehicle,
        transitRoute: config.transitRoute,
      },
      nextDeparture: activeDeparture,
      supported: true,
    };
  }, [departures, ferryRoute, transitRecords, checkIn]);
}
