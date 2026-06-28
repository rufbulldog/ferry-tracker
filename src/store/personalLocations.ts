import AsyncStorage from '@react-native-async-storage/async-storage';
import type { KnownLocation } from '../utils/locations';

export interface Coord {
  lat: number;
  lon: number;
}

export interface PersonalCoords {
  home?: Coord;
  work?: Coord;
  contactNumber?: string;
}

const STORAGE_KEY = '@ferry_app_personal_locations';

// In-memory cache so the (synchronous) location helpers can read current coords
// without an async round-trip. Populated by loadPersonalLocations() at startup
// and kept in sync by setPersonalCoords().
let cache: PersonalCoords = {};
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((fn) => fn());
}

/** Current home/work coords and contact number (synchronous read of the cache). */
export function getPersonalCoords(): PersonalCoords {
  return cache;
}

/** Current check-in contact number (synchronous read of the cache). */
export function getContactNumber(): string | undefined {
  return cache.contactNumber;
}

/** Home/work as KnownLocation[] for distance / routing logic. */
export function getPersonalLocations(): KnownLocation[] {
  const out: KnownLocation[] = [];
  if (cache.home) {
    out.push({ id: 'home', label: 'Home', lat: cache.home.lat, lon: cache.home.lon });
  }
  if (cache.work) {
    out.push({ id: 'work', label: 'Work', lat: cache.work.lat, lon: cache.work.lon });
  }
  return out;
}

/**
 * Load persisted coords into the in-memory cache. Call once at startup.
 * Returns true if stored data existed but could not be parsed (data loss).
 */
export async function loadPersonalLocations(): Promise<boolean> {
  let dataLost = false;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as PersonalCoords) : {};
  } catch {
    dataLost = true;
    cache = {};
  }
  emit();
  return dataLost;
}

/** Persist new coords and update the cache. */
export async function setPersonalCoords(next: PersonalCoords): Promise<void> {
  cache = next;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emit();
}

/** Subscribe to coord changes; returns an unsubscribe function. */
export function subscribePersonalLocations(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
