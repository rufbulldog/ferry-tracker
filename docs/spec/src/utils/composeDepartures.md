---
type: l1-file
spec_version: 1
source: src/utils/composeDepartures.ts
content_sha: 9fea9c979c43a0b9d80aa194c73d8d6de4039a820c3afe84c46b19ef9eea7f81
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:07:16.477Z
---

# composeDepartures.ts

**Path:** `src/utils/composeDepartures.ts`
**Lines:** 453
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `composeDepartures` | function | `(departingTerminalId: number, arrivingTerminalId: number, allVessels: VesselLocation[] \| undefined, terminals: TerminalSailingSpace[] \| undefined, now: number = Date.now()): DepartureInfo[]` |
| `hasRouteSailingSpace` | function | `(terminals: TerminalSailingSpace[] \| undefined, departingTerminalId: number, arrivingTerminalId: number): boolean` |
| `composeRouteDepartures` | function | `(departingTerminalId: number, arrivingTerminalId: number, allVessels: VesselLocation[] \| undefined, terminals: TerminalSailingSpace[] \| undefined, timetable: ScheduledSailing[] \| undefined, now: number = Date.now()): DepartureInfo[]` |
| `DepartureInfo` | interface |  |
| `ScheduledSailing` | interface |  |

### Documented exports

- **`hasRouteSailingSpace`** — True when WSF's sailing-space feed lists departures from → to.
- **`composeRouteDepartures`** — A route's departures, falling back to the timetable when WSF's sailing-space
- **`ScheduledSailing`** — One row of WSF's schedule `Times` (the fields we use).

## Imports

**Internal:**
- `../api/types` (`TerminalSailingSpace`, `VesselLocation`)
- `./predictedDelay` (`predictInboundDelay`, `PredictedDelayBasis`)
- `./time` (`calculateDelayMinutes`, `getMinutesUntil`, `parseDate`, `addMinutes`)
