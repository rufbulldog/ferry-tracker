/**
 * Predictive "leave by" for a *future* scheduled sailing — there's no live
 * vessel data for a future date, so this works purely off the scheduled time,
 * the user's recorded transit times, and historical delay/capacity trends.
 *
 * Mirrors the live Leave card's transit logic (useRecommendation) but is a pure
 * function so the planner can call it per sailing without any hooks.
 */
import { Route } from './constants';
import { Vehicle, TransitRecord, DepartureSnapshot } from '../types/storage';
import { TRAVEL_TIMES, TRANSIT_ROUTE_MAP } from './transitConfig';
import { computeTypicalTransitSeconds } from './transitStats';
import { computeTypicalForSlot } from './typicalConditions';

export interface PlanEstimate {
  /** False when this vehicle mode isn't used on this route (leaveBy is null). */
  available: boolean;
  leaveBy: Date | null;
  transitMinutes: number;
  bufferMinutes: number;
  /** True when transit came from recorded trips rather than the static default. */
  transitFromRecords: boolean;
  recordCount: number;
  /** Typical historical delay/capacity for this weekday+hour (null = no data). */
  typicalDelayMinutes: number | null;
  typicalCapacityPercent: number | null;
  historySampleSize: number;
}

// Once we have enough recorded trips, the robust stat replaces most of the
// static buffer — keep a 1-min floor as safety margin.
const RECORDED_MIN_SAMPLES = 5;
const RECORDED_BUFFER_FLOOR = 1;

export function computePlanEstimate(params: {
  sailing: Date;
  route: Route;
  vehicle: Vehicle;
  transitRecords: TransitRecord[] | undefined;
  trends: DepartureSnapshot[] | undefined;
}): PlanEstimate {
  const { sailing, route, vehicle, transitRecords, trends } = params;

  const config = TRAVEL_TIMES[route][vehicle];
  if (!config) {
    return {
      available: false,
      leaveBy: null,
      transitMinutes: 0,
      bufferMinutes: 0,
      transitFromRecords: false,
      recordCount: 0,
      typicalDelayMinutes: null,
      typicalCapacityPercent: null,
      historySampleSize: 0,
    };
  }

  let transitMinutes = config.travel;
  let bufferMinutes = config.buffer;
  let transitFromRecords = false;
  let recordCount = 0;

  const mapped = TRANSIT_ROUTE_MAP[route]?.[vehicle];
  if (mapped && transitRecords && transitRecords.length > 0) {
    const matching = transitRecords.filter((r) => r.route === mapped && r.vehicle === vehicle);
    const typical = computeTypicalTransitSeconds(matching);
    if (typical) {
      transitMinutes = Math.ceil(typical.seconds / 60);
      transitFromRecords = true;
      recordCount = typical.sampleSize;
      if (recordCount >= RECORDED_MIN_SAMPLES) bufferMinutes = RECORDED_BUFFER_FLOOR;
    }
  }

  const typical = computeTypicalForSlot(trends, sailing);
  const leaveBy = new Date(sailing.getTime() - (transitMinutes + bufferMinutes) * 60_000);

  return {
    available: true,
    leaveBy,
    transitMinutes,
    bufferMinutes,
    transitFromRecords,
    recordCount,
    typicalDelayMinutes: typical.delayMinutes,
    typicalCapacityPercent: typical.capacityPercent,
    historySampleSize: typical.sampleSize,
  };
}
