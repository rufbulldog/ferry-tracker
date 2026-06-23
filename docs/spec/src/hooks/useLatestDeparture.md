---
type: l1-file
spec_version: 1
source: src/hooks/useLatestDeparture.ts
content_sha: 97080a7523a501617448d82cd925cbf01e3c38db35fc8499cd49eb92fb249a2d
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.662Z
---

# useLatestDeparture.ts

**Path:** `src/hooks/useLatestDeparture.ts`
**Lines:** 61
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

**External:**
- `@tanstack/react-query` (`useQuery`)
