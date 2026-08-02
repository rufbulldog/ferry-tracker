---
type: l1-file
spec_version: 1
source: src/hooks/useFutureSchedule.ts
content_sha: 9a1b0ea648376c1819e2c1523f565110281efb05c03337a432638c0c76b5e448
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-02T05:28:25.677Z
---

# useFutureSchedule.ts

**Path:** `src/hooks/useFutureSchedule.ts`
**Lines:** 49
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useFutureSchedule` | function | `(route: Route, tripDate: string): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/react-query/build/legacy/types").DefinedUseQueryResult<unknown, Error>` |
| `useValidDateRange` | function | `(): { from: any; thru: any; }` |
| `PlannedSailing` | interface |  |

### Documented exports

- **`useFutureSchedule`** — Full sailing list for a route on a given date (YYYY-MM-DD). Schedules are
- **`useValidDateRange`** — The date window WSF publishes schedules for, as JS Dates (null while loading).

## Imports

**Internal:**
- `../api/schedule` (`fetchScheduleForDate`, `fetchValidDateRange`)
- `../utils/constants` (`ROUTES`, `Route`)
- `../utils/time` (`parseDate`)

**External:**
- `@tanstack/react-query` (`useQuery`)
