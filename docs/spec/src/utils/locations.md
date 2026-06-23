---
type: l1-file
spec_version: 1
source: src/utils/locations.ts
content_sha: 6df5827c5239e6a9947929c9eaae0a49afec03725a21ab975e0d71ce184d68d0
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.720Z
---

# locations.ts

**Path:** `src/utils/locations.ts`
**Lines:** 94
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
