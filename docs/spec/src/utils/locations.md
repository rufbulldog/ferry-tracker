---
type: l1-file
spec_version: 1
source: src/utils/locations.ts
content_sha: 58b5b18b2f233f87555a49459bee41b3ab0f5de0880dec8aa739d2d94760fa38
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:33:01.002Z
---

# locations.ts

**Path:** `src/utils/locations.ts`
**Lines:** 130
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `getPublicTerminals` | function | `(): KnownLocation[]` |
| `getTerminalLocation` | function | `(id: string): KnownLocation \| null` |
| `getKnownLocations` | function | `(): KnownLocation[]` |
| `findNearestLocation` | function | `(lat: number, lon: number): { location: KnownLocation; distanceMeters: number } \| null` |
| `getRouteDefaults` | function | `(locationId: string, enabledGroups: readonly RouteGroup[] = DEFAULT_ENABLED_ROUTE_GROUPS): { routeGroup: RouteGroup; direction: Direction } \| null` |
| `getTimerRouteDefault` | function | `(locationId: string): string \| null` |
| `haversineDistance` | function | `(lat1: number, lon1: number, lat2: number, lon2: number): number` |
| `KnownLocation` | interface |  |

### Documented exports

- **`getPublicTerminals`** — The public ferry terminals (published by WSDOT).
- **`getTerminalLocation`** — A public ferry terminal by its location id (e.g. 'kingston-terminal').
- **`getRouteDefaults`** — Map nearest location to route group + direction defaults, among the groups
- **`haversineDistance`** — Haversine distance in meters between two lat/lon points.

## Imports

**Internal:**
- `../store/personalLocations` (`getPersonalLocations`)
- `../types/location` (`KnownLocation`)
- `./geo` (`haversineDistance`)
- `./routeGroups` (`DEFAULT_ENABLED_ROUTE_GROUPS`, `Direction`, `RouteGroup`)
