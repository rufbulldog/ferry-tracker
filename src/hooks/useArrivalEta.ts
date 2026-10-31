import { useMemo, useSyncExternalStore } from 'react';
import { useNextDepartures, DepartureInfo } from './useNextDepartures';
import { useTransitRecords } from './useTransitRecords';
import { useRecentTrends } from './useDailyTrends';
import { Route, crossingMinutesForRoute } from '../utils/constants';
import { parseDate } from '../utils/time';
import {
  selectActiveDeparture,
  etaDepartureBasis,
} from '../utils/arrivalEtaLogic';
import { ARRIVAL_CONFIG, ArrivalEta, computeArrival } from '../utils/arrivalPlan';
import { getCheckIn, subscribeCheckIn } from '../store/checkIn';

export type { ArrivalEta, ArrivalKind } from '../utils/arrivalPlan';

// How long after a pinned sailing's ferry arrival we keep honoring the pin
// before treating it as stale (covers a slow walk off the boat).
const CHECKIN_GRACE_MINUTES = 20;

export interface ArrivalEtaResult {
  arrival: ArrivalEta | null;
  nextDeparture: DepartureInfo | null;
  supported: boolean; // false for routes we don't compute arrival for
}

export function useArrivalEta(ferryRoute: Route): ArrivalEtaResult {
  const { data: departures } = useNextDepartures(ferryRoute);
  const { data: transitRecords } = useTransitRecords();
  const { data: trends } = useRecentTrends(ferryRoute, 30);
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
      const arrivalCutoff = checkIn.scheduledDeparture + (crossingMinutesForRoute(ferryRoute) + CHECKIN_GRACE_MINUTES) * 60_000;
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

    // Live Eta once underway (that IS the real arrival); computeArrival falls
    // back to the measured typical crossing, then the nominal one.
    const arrival = computeArrival({
      route: ferryRoute,
      departureTime: etaDepartureBasis(activeDeparture),
      liveEta: parseDate(activeDeparture.etaRaw),
      transitRecords,
      trends,
    });

    return { arrival, nextDeparture: activeDeparture, supported: true };
  }, [departures, ferryRoute, transitRecords, checkIn, trends]);
}

/**
 * Arrival for the sailing the leave-by plan targets (not the boat currently
 * loading or underway — that's useArrivalEta's job for Send ETA). Uses the
 * same crossing + far-side transit math, starting from the planned departure.
 */
export function usePlannedArrival(ferryRoute: Route, plannedDeparture: Date | null): ArrivalEta | null {
  const { data: transitRecords } = useTransitRecords();
  const { data: trends } = useRecentTrends(ferryRoute, 30);

  const plannedMs = plannedDeparture?.getTime() ?? null;
  return useMemo(() => {
    if (plannedMs == null) return null;
    return computeArrival({
      route: ferryRoute,
      departureTime: new Date(plannedMs),
      transitRecords,
      trends,
    });
  }, [ferryRoute, plannedMs, transitRecords, trends]);
}
