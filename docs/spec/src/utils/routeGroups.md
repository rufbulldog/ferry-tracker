---
type: l1-file
spec_version: 1
source: src/utils/routeGroups.ts
content_sha: 0818c6fd9167cf465d08912548cc4bb1893c296d01065d4aacd014830afd1a54
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:07:16.483Z
---

# routeGroups.ts

**Path:** `src/utils/routeGroups.ts`
**Lines:** 86
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `routeFor` | function | `(group: RouteGroup, direction: Direction): Route` |
| `selectionFor` | function | `(route: Route): { group: RouteGroup; direction: Direction }` |
| `oppositeRoute` | function | `(route: Route): Route` |
| `normalizeEnabledGroups` | function | `(groups: readonly string[] \| null \| undefined): RouteGroup[]` |
| `RouteGroup` | type |  |
| `Direction` | type |  |
| `RouteGroupInfo` | interface |  |
| `ROUTE_GROUPS` | const | `Record<RouteGroup, RouteGroupInfo>` |
| `ALL_ROUTE_GROUPS` | const | `RouteGroup[]` |
| `DEFAULT_ENABLED_ROUTE_GROUPS` | const | `RouteGroup[]` |

### Documented exports

- **`selectionFor`** — The group + direction a route belongs to.
- **`oppositeRoute`** — The same crossing the other way.
- **`normalizeEnabledGroups`** — Keep only known groups, in display order; never empty.

## Imports

**Internal:**
- `./constants` (`Route`)
