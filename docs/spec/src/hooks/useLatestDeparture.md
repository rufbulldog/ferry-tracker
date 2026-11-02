---
type: l1-file
spec_version: 1
source: src/hooks/useLatestDeparture.ts
content_sha: 5d205e35a8d0c1ed8fb96636785351fc585c37c533361f7fdb24ccf84a950054
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:07:16.435Z
---

# useLatestDeparture.ts

**Path:** `src/hooks/useLatestDeparture.ts`
**Lines:** 50
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useLatestDeparture` | function | `(route: Route): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/react-query/build/legacy/types").DefinedUseQueryResult<unknown, Error>` |
| `useLatestDeparturePair` | function | `(route: Route): { latestDeparture: unknown; latestIncoming: unknown; isLoading: false; }` |

## Imports

**Internal:**
- `../api/backend` (`getLatestDepartures`)
- `../types/storage` (`DepartureSnapshot`)
- `../utils/constants` (`Route`)
- `../utils/routeGroups` (`oppositeRoute as routeOtherWay`)

**External:**
- `@tanstack/react-query` (`useQuery`)
