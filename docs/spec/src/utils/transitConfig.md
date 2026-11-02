---
type: l1-file
spec_version: 1
source: src/utils/transitConfig.ts
content_sha: 77a99b6959b48d2a5c8c32f1102325581661c084513774c78401eb23523d40dc
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:07:16.484Z
---

# transitConfig.ts

**Path:** `src/utils/transitConfig.ts`
**Lines:** 59
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `TRAVEL_TIMES` | const | `Record<Route, {
  bike: { travel: number; buffer: number } \| null;
  car: { travel: number; buffer: number } \| null;
}>` |
| `TRANSIT_ROUTE_MAP` | const | `Partial<Record<Route, Partial<Record<Vehicle, TransitRoute>>>>` |

## Imports

**Internal:**
- `../types/storage` (`Vehicle`, `TransitRoute`)
- `./constants` (`Route`)
