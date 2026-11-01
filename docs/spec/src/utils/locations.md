---
type: l1-file
spec_version: 1
source: src/utils/locations.ts
content_sha: 1b437815bc68578927f944248f1de77d4e8cbae59dd5bac3a6180a5078b139ac
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-01T19:07:47.895Z
---

# locations.ts

**Path:** `src/utils/locations.ts`
**Lines:** 118
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `getTerminalLocation` | function | `(id: string): KnownLocation \| null` |
| `getKnownLocations` | function | `(): KnownLocation[]` |
| `haversineDistance` | function | `(lat1: number, lon1: number, lat2: number, lon2: number): number` |
| `findNearestLocation` | function | `(lat: number, lon: number): { location: KnownLocation; distanceMeters: number } \| null` |
| `getRouteDefaults` | function | `(locationId: string): { routeGroup: "bainbridge" \| "kingston"; direction: "outbound" \| "inbound"; }` |
| `getTimerRouteDefault` | function | `(locationId: string): string \| null` |
| `KnownLocation` | interface |  |

### Documented exports

- **`getTerminalLocation`** — A public ferry terminal by its location id (e.g. 'kingston-terminal').

## Imports

**Internal:**
- `../store/personalLocations` (`getPersonalLocations`)
- `../types/location` (`KnownLocation`)
