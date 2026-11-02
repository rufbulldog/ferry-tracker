---
type: l1-file
spec_version: 1
source: src/utils/composeDepartures.ts
content_sha: 9eb877fcc72a139a62069d4380ea3e27b32cd3f0c418b1c7d5b7e66f63794c6e
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T02:40:10.720Z
---

# composeDepartures.ts

**Path:** `src/utils/composeDepartures.ts`
**Lines:** 367
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `composeDepartures` | function | `(departingTerminalId: number, arrivingTerminalId: number, allVessels: VesselLocation[] \| undefined, terminals: TerminalSailingSpace[] \| undefined, now: number = Date.now()): DepartureInfo[]` |
| `DepartureInfo` | interface |  |

## Imports

**Internal:**
- `../api/types` (`TerminalSailingSpace`, `VesselLocation`)
- `./predictedDelay` (`predictInboundDelay`, `PredictedDelayBasis`)
- `./time` (`calculateDelayMinutes`, `getMinutesUntil`, `parseDate`, `addMinutes`)
