import { getPersonalLocations } from "../store/personalLocations";
import type { KnownLocation } from "../types/location";
import { haversineDistance } from "./geo";
import {
  DEFAULT_ENABLED_ROUTE_GROUPS,
  Direction,
  RouteGroup,
} from "./routeGroups";

export { haversineDistance };

export type { KnownLocation };

// Ferry terminals are public information (published by WSDOT) and safe to commit.
const PUBLIC_TERMINALS: KnownLocation[] = [
  {
    id: "bi-terminal",
    label: "Bainbridge Ferry Terminal",
    lat: 47.6235,
    lon: -122.5104,
  },
  {
    id: "seattle-terminal",
    label: "Seattle Ferry Terminal",
    lat: 47.6023,
    lon: -122.3384,
  },
  {
    id: "kingston-terminal",
    label: "Kingston Ferry Terminal",
    lat: 47.7964,
    lon: -122.4949,
  },
  {
    id: "edmonds-terminal",
    label: "Edmonds Ferry Terminal",
    lat: 47.8106,
    lon: -122.3844,
  },
  {
    id: "bremerton-terminal",
    label: "Bremerton Ferry Terminal",
    lat: 47.5622,
    lon: -122.6247,
  },
];

/** The public ferry terminals (published by WSDOT). */
export function getPublicTerminals(): KnownLocation[] {
  return PUBLIC_TERMINALS;
}

/** A public ferry terminal by its location id (e.g. 'kingston-terminal'). */
export function getTerminalLocation(id: string): KnownLocation | null {
  return PUBLIC_TERMINALS.find((t) => t.id === id) ?? null;
}

// Personal home/work locations come from on-device settings (AsyncStorage), not
// from EXPO_PUBLIC_ env vars — so they never ship inside the app bundle. See
// src/store/personalLocations.ts and the Settings screen. When unset, the app
// falls back to the public terminals only.
export function getKnownLocations(): KnownLocation[] {
  return [...getPersonalLocations(), ...PUBLIC_TERMINALS];
}

// Find the nearest known location to a given lat/lon
export function findNearestLocation(
  lat: number,
  lon: number,
): { location: KnownLocation; distanceMeters: number } | null {
  let nearest: { location: KnownLocation; distanceMeters: number } | null =
    null;

  for (const loc of getKnownLocations()) {
    const d = haversineDistance(lat, lon, loc.lat, loc.lon);
    if (!nearest || d < nearest.distanceMeters) {
      nearest = { location: loc, distanceMeters: d };
    }
  }

  return nearest;
}

// Where each known location puts you, best match first. Seattle's terminal
// serves two groups, so it falls through to Bremerton when Bainbridge is off.
const LOCATION_ROUTES: Record<string, { routeGroup: RouteGroup; direction: Direction }[]> = {
  home: [{ routeGroup: "bainbridge", direction: "outbound" }],
  "bi-terminal": [{ routeGroup: "bainbridge", direction: "outbound" }],
  work: [{ routeGroup: "bainbridge", direction: "inbound" }],
  "seattle-terminal": [
    { routeGroup: "bainbridge", direction: "inbound" },
    { routeGroup: "bremerton", direction: "inbound" },
  ],
  "kingston-terminal": [{ routeGroup: "kingston", direction: "outbound" }],
  "edmonds-terminal": [{ routeGroup: "kingston", direction: "inbound" }],
  "bremerton-terminal": [{ routeGroup: "bremerton", direction: "outbound" }],
};

/**
 * Map nearest location to route group + direction defaults, among the groups
 * the user has enabled. Null when that location's only groups are switched off
 * (leave the selection alone); an unknown location gets the first enabled group.
 */
export function getRouteDefaults(
  locationId: string,
  enabledGroups: readonly RouteGroup[] = DEFAULT_ENABLED_ROUTE_GROUPS,
): { routeGroup: RouteGroup; direction: Direction } | null {
  const options = LOCATION_ROUTES[locationId];
  if (!options) {
    return { routeGroup: enabledGroups[0] ?? "bainbridge", direction: "outbound" };
  }
  return options.find((o) => enabledGroups.includes(o.routeGroup)) ?? null;
}

// Map nearest location to a timer route default
export function getTimerRouteDefault(locationId: string): string | null {
  switch (locationId) {
    case "home":
      return "bi-home-to-ferry";
    case "bi-terminal":
      return "bi-ferry-to-home";
    case "seattle-terminal":
      return "bi-ferry-to-work";
    case "work":
      return "bi-work-to-ferry";
    default:
      return null;
  }
}
