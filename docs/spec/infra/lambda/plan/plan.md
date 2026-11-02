---
type: l1-file
spec_version: 1
source: infra/lambda/plan/plan.ts
content_sha: 4e684e3c2cdfe0b2b94a4ee73f9574c16996ff2ad9fa9f204f7208bde8b49eec
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:07:16.399Z
---

# plan.ts

**Path:** `infra/lambda/plan/plan.ts`
**Lines:** 454
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
| `DEFAULT_PLAN_ROUTES` | const | `string[]` |
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
- `../../../src/utils/composeDepartures` (`composeRouteDepartures`, `DepartureInfo`, `hasRouteSailingSpace`, `ScheduledSailing`)
- `../../../src/utils/constants` (`ROUTES`, `Route`, `crossingMinutesForRoute`)
- `../../../src/utils/ferryDeparture` (`deriveSailingIntervalMinutes`, `effectiveFerryDeparture`)
- `../../../src/utils/geo` (`haversineDistance`)
- `../../../src/utils/routeGroups` (`DEFAULT_ENABLED_ROUTE_GROUPS`, `ROUTE_GROUPS`)
- `../../../src/utils/time` (`parseDate`, `addMinutes`)
- `../../../src/utils/transitConfig` (`TRAVEL_TIMES`)
- `../../../src/utils/typicalConditions` (`computeTypicalForSlot`)
