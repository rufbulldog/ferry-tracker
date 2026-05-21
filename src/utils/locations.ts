export interface KnownLocation {
  id: string;
  label: string;
  lat: number;
  lon: number;
}

// Personal locations (home/work) are loaded from environment variables so they
// stay out of source control. Set EXPO_PUBLIC_HOME_LAT / _LON / EXPO_PUBLIC_WORK_LAT / _LON
// in your local .env (see .env.example). If unset, home/work are simply omitted from
// the known-location list and the app falls back to terminals only.
function parseEnvCoord(v: string | undefined): number | null {
  if (!v) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function buildPersonalLocations(): KnownLocation[] {
  const personal: KnownLocation[] = [];
  const homeLat = parseEnvCoord(process.env.EXPO_PUBLIC_HOME_LAT);
  const homeLon = parseEnvCoord(process.env.EXPO_PUBLIC_HOME_LON);
  if (homeLat !== null && homeLon !== null) {
    personal.push({ id: 'home', label: 'Home', lat: homeLat, lon: homeLon });
  }
  const workLat = parseEnvCoord(process.env.EXPO_PUBLIC_WORK_LAT);
  const workLon = parseEnvCoord(process.env.EXPO_PUBLIC_WORK_LON);
  if (workLat !== null && workLon !== null) {
    personal.push({ id: 'work', label: 'Work', lat: workLat, lon: workLon });
  }
  return personal;
}

// Ferry terminals are public information (published by WSDOT) and safe to commit.
const PUBLIC_TERMINALS: KnownLocation[] = [
  { id: 'bi-terminal', label: 'Bainbridge Ferry Terminal', lat: 47.6235, lon: -122.5104 },
  { id: 'seattle-terminal', label: 'Seattle Ferry Terminal', lat: 47.6023, lon: -122.3384 },
  { id: 'kingston-terminal', label: 'Kingston Ferry Terminal', lat: 47.7964, lon: -122.4949 },
  { id: 'edmonds-terminal', label: 'Edmonds Ferry Terminal', lat: 47.8106, lon: -122.3844 },
];

export const KNOWN_LOCATIONS: KnownLocation[] = [
  ...buildPersonalLocations(),
  ...PUBLIC_TERMINALS,
];

// Haversine distance in meters between two lat/lon points
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find the nearest known location to a given lat/lon
export function findNearestLocation(
  lat: number,
  lon: number,
): { location: KnownLocation; distanceMeters: number } | null {
  let nearest: { location: KnownLocation; distanceMeters: number } | null = null;

  for (const loc of KNOWN_LOCATIONS) {
    const d = haversineDistance(lat, lon, loc.lat, loc.lon);
    if (!nearest || d < nearest.distanceMeters) {
      nearest = { location: loc, distanceMeters: d };
    }
  }

  return nearest;
}

// Map nearest location to route group + direction defaults
export function getRouteDefaults(locationId: string): {
  routeGroup: 'bainbridge' | 'kingston';
  direction: 'outbound' | 'inbound';
} {
  switch (locationId) {
    case 'home':
    case 'bi-terminal':
      return { routeGroup: 'bainbridge', direction: 'outbound' };
    case 'work':
    case 'seattle-terminal':
      return { routeGroup: 'bainbridge', direction: 'inbound' };
    case 'kingston-terminal':
      return { routeGroup: 'kingston', direction: 'outbound' };
    case 'edmonds-terminal':
      return { routeGroup: 'kingston', direction: 'inbound' };
    default:
      return { routeGroup: 'bainbridge', direction: 'outbound' };
  }
}

// Map nearest location to a timer route default
export function getTimerRouteDefault(locationId: string): string | null {
  switch (locationId) {
    case 'home':
      return 'bi-home-to-ferry';
    case 'bi-terminal':
      return 'bi-ferry-to-home';
    case 'seattle-terminal':
      return 'bi-ferry-to-work';
    case 'work':
      return 'bi-work-to-ferry';
    default:
      return null;
  }
}
