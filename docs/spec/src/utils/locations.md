---
type: l1-file
spec_version: 1
source: src/utils/locations.ts
content_sha: 87de8c33cc41b4fc927d279e94a31a3de5e88dec23a4eaa30494794800197c06
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-07-31T23:25:27.524Z
---

# locations.ts

**Path:** `src/utils/locations.ts`
**Lines:** 90
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `getKnownLocations` | function | `(): KnownLocation[]` |
| `haversineDistance` | function | `(lat1: number, lon1: number, lat2: number, lon2: number): number` |
| `findNearestLocation` | function | `(lat: number, lon: number): { location: KnownLocation; distanceMeters: number } \| null` |
| `getRouteDefaults` | function | `(locationId: string): { routeGroup: 'bainbridge' \| 'kingston'; direction: 'outbound' \| 'inbound'; }` |
| `getTimerRouteDefault` | function | `(locationId: string): string \| null` |
| `KnownLocation` | interface |  |

## Imports

**Internal:**
- `../store/personalLocations` (`getPersonalLocations`)
- `../types/location` (`KnownLocation`)
