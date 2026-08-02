---
type: l1-file
spec_version: 1
source: src/utils/transitConfig.ts
content_sha: afcf06fa3b02e39b8e0586e752db20b96288d60dcfef6d0e41944f047ab7e2c5
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-02T05:28:25.722Z
---

# transitConfig.ts

**Path:** `src/utils/transitConfig.ts`
**Lines:** 50
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
