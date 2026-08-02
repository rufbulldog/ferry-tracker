/**
 * Shared travel-time configuration for the live Leave card (useRecommendation)
 * and the future-schedule planner (planEstimate). Kept in one place so both use
 * the same defaults and route→transit-segment mapping.
 */
import { Route } from './constants';
import { Vehicle, TransitRoute } from '../types/storage';

// Static fallback travel/buffer minutes by ferry route and vehicle.
// null means that mode is not used for this route.
export const TRAVEL_TIMES: Record<Route, {
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
    bike: null,
    car: null,
  },
};

// Map (ferry route, vehicle) → TransitRoute for looking up recorded averages.
export const TRANSIT_ROUTE_MAP: Partial<Record<Route, Partial<Record<Vehicle, TransitRoute>>>> = {
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
