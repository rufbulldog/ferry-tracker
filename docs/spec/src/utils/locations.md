---
type: l1-file
spec_version: 1
source: src/utils/locations.ts
content_sha: 28e51c83cecac1f6a00094075c88d46351ccb7974b5756e3f01f5c96e35a7e25
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:07:16.480Z
---

# locations.ts

**Path:** `src/utils/locations.ts`
**Lines:** 125
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `getTerminalLocation` | function | `(id: string): KnownLocation \| null` |
| `getKnownLocations` | function | `(): KnownLocation[]` |
| `findNearestLocation` | function | `(lat: number, lon: number): { location: KnownLocation; distanceMeters: number } \| null` |
| `getRouteDefaults` | function | `(locationId: string, enabledGroups: readonly RouteGroup[] = DEFAULT_ENABLED_ROUTE_GROUPS): { routeGroup: RouteGroup; direction: Direction } \| null` |
| `getTimerRouteDefault` | function | `(locationId: string): string \| null` |
| `haversineDistance` | function | `(lat1: number, lon1: number, lat2: number, lon2: number): number` |
| `KnownLocation` | interface |  |

### Documented exports

- **`getTerminalLocation`** — A public ferry terminal by its location id (e.g. 'kingston-terminal').
- **`getRouteDefaults`** — Map nearest location to route group + direction defaults, among the groups
- **`haversineDistance`** — Haversine distance in meters between two lat/lon points.

## Imports

**Internal:**
- `../store/personalLocations` (`getPersonalLocations`)
- `../types/location` (`KnownLocation`)
- `./geo` (`haversineDistance`)
- `./routeGroups` (`DEFAULT_ENABLED_ROUTE_GROUPS`, `Direction`, `RouteGroup`)
