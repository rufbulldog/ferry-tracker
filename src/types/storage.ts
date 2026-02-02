// Transit time record for Timer feature
export interface TransitRecord {
  id: string;
  route: TransitRoute;
  vehicle: Vehicle;
  durationSeconds: number;
  timestamp: string; // ISO date string
}

export type TransitRoute = 'home-to-ferry' | 'ferry-to-work' | 'work-to-ferry' | 'ferry-to-home';
export type Vehicle = 'car' | 'bike';

// Departure snapshot for Trends feature
export interface DepartureSnapshot {
  id: string;
  scheduledTime: string; // ISO date string
  actualTime: string | null; // ISO date string
  delayMinutes: number;
  capacityPercent: number;
  route: string;
  timestamp: string; // ISO date string
}

// Daily trend cache
export interface DailyTrends {
  date: string; // YYYY-MM-DD
  snapshots: DepartureSnapshot[];
}

// User preferences
export interface UserPreferences {
  defaultRouteGroup: 'bainbridge' | 'kingston';
  defaultDirection: 'outbound' | 'inbound';
  defaultVehicle: Vehicle;
}

// Storage keys
export const STORAGE_KEYS = {
  TRANSIT_RECORDS: '@ferry/transit-records',
  TRENDS_PREFIX: '@ferry/trends-', // Append YYYY-MM-DD
  PREFERENCES: '@ferry/preferences',
} as const;
