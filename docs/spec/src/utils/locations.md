---
type: l1-file
spec_version: 1
source: src/utils/locations.ts
content_sha: 1aab46510f4188ad83ceea6a7ab525154a0d3372c227aef8f41e1dd47c6337bd
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T02:40:10.722Z
---

# locations.ts

**Path:** `src/utils/locations.ts`
**Lines:** 104
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `getTerminalLocation` | function | `(id: string): KnownLocation \| null` |
| `getKnownLocations` | function | `(): KnownLocation[]` |
| `findNearestLocation` | function | `(lat: number, lon: number): { location: KnownLocation; distanceMeters: number } \| null` |
| `getRouteDefaults` | function | `(locationId: string): { routeGroup: "bainbridge" \| "kingston"; direction: "outbound" \| "inbound"; }` |
| `getTimerRouteDefault` | function | `(locationId: string): string \| null` |
| `haversineDistance` | function | `(lat1: number, lon1: number, lat2: number, lon2: number): number` |
| `KnownLocation` | interface |  |

### Documented exports

- **`getTerminalLocation`** — A public ferry terminal by its location id (e.g. 'kingston-terminal').
- **`haversineDistance`** — Haversine distance in meters between two lat/lon points.

## Imports

**Internal:**
- `../store/personalLocations` (`getPersonalLocations`)
- `../types/location` (`KnownLocation`)
- `./geo` (`haversineDistance`)
