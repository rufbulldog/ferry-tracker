---
type: l1-file
spec_version: 1
source: src/hooks/useDailyTrends.ts
content_sha: 23569ca914a0dba2f241df03bbc58542bdd900912fdf9a1a06c8f2d27f244fc5
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.656Z
---

# useDailyTrends.ts

**Path:** `src/hooks/useDailyTrends.ts`
**Lines:** 124
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useTodayTrends` | function | `(route: Route): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/react-query/build/legacy/types").DefinedUseQueryResult<unknown, Error>` |
| `useRecentTrends` | function | `(route: Route, days: number = 7): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/react-query/build/legacy/types").DefinedUseQueryResult<unknown, Error>` |
| `calculateAverageDelay` | function | `(snapshots: DepartureSnapshot[]): number` |
| `calculateAverageCapacity` | function | `(snapshots: DepartureSnapshot[]): number` |
| `getHourlyDelays` | function | `(snapshots: DepartureSnapshot[]): { hour: number; delay: number }[]` |
| `getDepartureCapacities` | function | `(snapshots: DepartureSnapshot[]): { time: string; capacity: number }[]` |
| `getHourlyCapacities` | function | `(snapshots: DepartureSnapshot[]): { hour: number; capacity: number }[]` |
| `getDailyDelays` | function | `(snapshots: DepartureSnapshot[]): { date: string; delay: number; dayOfWeek: number }[]` |

## Imports

**Internal:**
- `../api/backend` (`getTodayTrends`, `getRecentTrends`)
- `../types/storage` (`DepartureSnapshot`)
- `../utils/constants` (`Route`)

**External:**
- `@tanstack/react-query` (`useQuery`)
