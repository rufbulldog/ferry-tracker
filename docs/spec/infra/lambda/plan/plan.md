---
type: l1-file
spec_version: 1
source: infra/lambda/plan/plan.ts
content_sha: 9c5a720406edd4b9603c0e9ac1420552ab9ecf32d1d4e89f7f1f4fa27a2ce6dc
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T02:40:10.649Z
---

# plan.ts

**Path:** `infra/lambda/plan/plan.ts`
**Lines:** 492
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `parsePlanQuery` | function | `(params: Record<string, string \| undefined> \| null): ParseResult` |
| `candidateRoutes` | function | `(routes: string[], location: { lat: number; lon: number }): string[]` |
| `hasSailingSpace` | function | `(terminals: TerminalSailingSpace[] \| undefined, routeId: string): boolean` |
| `buildPlan` | function | `(query: PlanQuery, inputs: PlanInputs, now: Date): PlanResponse` |
| `departingTerminals` | function | `(routes: string[]): number[]` |
| `TERMINALS` | const | `Record<
  number,
  { name: string; lat: number; lon: number }
>` |
| `PlanRoute` | interface |  |
| `PLAN_ROUTES` | const | `Record<string, PlanRoute>` |
| `PlanQuery` | interface |  |
| `ParseResult` | type |  |
| `PlanInputs` | interface |  |
| `ScheduledSailing` | interface |  |
| `SailingOut` | interface |  |
| `CarWaitOut` | interface |  |
| `RouteOut` | interface |  |
| `PickOut` | interface |  |
| `PlanResponse` | interface |  |

### Documented exports

- **`candidateRoutes`** — Routes to plan against. A terminal pair is one crossing; you're on whichever
- **`hasSailingSpace`** — True when WSF's sailing-space feed lists departures for this route.
- **`departingTerminals`** — WSF terminals whose wait notes + bulletins the query needs.
- **`PlanInputs`** — Raw inputs the handler gathered. Per-terminal maps are keyed by WSF terminal id.
- **`ScheduledSailing`** — One row of WSF's schedule `Times` (the fields we use).

## Imports

**Internal:**
- `../../../src/api/types` (`TerminalBulletin`, `TerminalSailingSpace`, `VesselLocation`, `WaitTime`)
- `../../../src/types/storage` (`DepartureSnapshot`)
- `../../../src/utils/bestSailing` (`pickBestSailing`, `SailingCandidate`, `SailingPick`)
- `../../../src/utils/bulletins` (`processBulletins`, `pickActiveAlert`)
- `../../../src/utils/carWait` (`estimateCarWait`, `CarWaitEstimate`)
- `../../../src/utils/composeDepartures` (`composeDepartures`, `DepartureInfo`)
- `../../../src/utils/constants` (`ROUTES`, `Route`, `crossingMinutesForRoute`)
- `../../../src/utils/ferryDeparture` (`deriveSailingIntervalMinutes`, `effectiveFerryDeparture`)
- `../../../src/utils/geo` (`haversineDistance`)
- `../../../src/utils/time` (`parseDate`, `addMinutes`)
- `../../../src/utils/transitConfig` (`TRAVEL_TIMES`)
- `../../../src/utils/typicalConditions` (`computeTypicalForSlot`)
