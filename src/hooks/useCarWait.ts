import { useMemo } from 'react';
import { useNextDepartures, DepartureInfo } from './useNextDepartures';
import { useTerminalWaitTimes } from './useTerminalWaitTimes';
import { useTerminalBulletins } from './useTerminalBulletins';
import { useRecentTrends } from './useDailyTrends';
import { ROUTES, Route } from '../utils/constants';
import { estimateCarWait, CarWaitEstimate } from '../utils/carWait';
import { deriveSailingIntervalMinutes, effectiveFerryDeparture } from '../utils/ferryDeparture';
import { computeTypicalForSlot } from '../utils/typicalConditions';

// Fallback spacing when we can't derive it from the live schedule (minutes).
const DEFAULT_SAILING_INTERVAL = 50;

export interface CarWaitResult {
  estimate: CarWaitEstimate;
  /** The next sailing a driver is evaluated against (may be null off-hours). */
  nextDeparture: DepartureInfo | null;
  /**
   * The sailing a car can realistically board once overflow is priced in — the
   * next one if the estimate says you'll miss this boat, else this one.
   */
  boardableDeparture: DepartureInfo | null;
  /** Boardable sailing's effective ferry-departure time (or null). */
  boardableDepartureTime: Date | null;
}

/**
 * Combine live capacity, WSF wait-time notes, WSF alerts, and recorded history
 * into a single car-overflow estimate for the next sailing on a route, plus the
 * sailing a driver can actually board. Pure logic lives in carWait.ts; this hook
 * only wires the data sources.
 */
export function useCarWait(route: Route): CarWaitResult {
  const { data: departures } = useNextDepartures(route);
  const { notes: waitNoteText } = useTerminalWaitTimes(ROUTES[route].from);
  const { activeAlert } = useTerminalBulletins(route);
  const { data: recentTrends } = useRecentTrends(route, 14);

  return useMemo(() => {
    const upcoming = (departures ?? []).filter(d => d.status !== 'departed' && !d.isCancelled);
    const nextDeparture = upcoming[0] ?? null;

    if (!nextDeparture) {
      return {
        estimate: { extraSailings: 0, extraMinutes: 0, atRisk: false, reason: 'none', confidence: 'low', note: null },
        nextDeparture: null,
        boardableDeparture: null,
        boardableDepartureTime: null,
      };
    }

    const sailingIntervalMinutes = deriveSailingIntervalMinutes(
      (departures ?? []).map(d => d.scheduledDeparture),
      DEFAULT_SAILING_INTERVAL,
    );

    const typical = computeTypicalForSlot(recentTrends, nextDeparture.scheduledDeparture);

    const estimate = estimateCarWait({
      liveDriveUpSpaces: nextDeparture.driveUpSpaces,
      maxSpaces: nextDeparture.maxSpaces,
      historicalCapacityPercent: typical.capacityPercent,
      historicalSampleSize: typical.sampleSize,
      waitNoteText,
      alertText: activeAlert?.text ?? null,
      sailingIntervalMinutes,
    });

    // A car that misses this boat boards `extraSailings` later.
    const boardableDeparture = upcoming[Math.min(estimate.extraSailings, upcoming.length - 1)] ?? nextDeparture;
    const boardableDepartureTime = effectiveFerryDeparture(boardableDeparture).time;

    return { estimate, nextDeparture, boardableDeparture, boardableDepartureTime };
  }, [departures, waitNoteText, activeAlert, recentTrends]);
}
