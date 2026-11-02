---
type: l1-file
spec_version: 1
source: src/utils/commute.ts
content_sha: ad7e7d7934d7e29383b9a4eb8993847d997a311b25d46e7992893d69cdced216
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:33:01.001Z
---

# commute.ts

**Path:** `src/utils/commute.ts`
**Lines:** 24
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `isAwayFromCommute` | function | `(lat: number, lon: number, personal: KnownLocation[], terminals: KnownLocation[]): boolean` |
| `COMMUTE_RADIUS_METERS` | const | `1000` |

## Imports

**Internal:**
- `../types/location` (`KnownLocation`)
- `./bestSailing` (`AT_TERMINAL_METERS`)
- `./geo` (`haversineDistance`)
