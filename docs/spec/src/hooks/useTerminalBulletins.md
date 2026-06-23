---
type: l1-file
spec_version: 1
source: src/hooks/useTerminalBulletins.ts
content_sha: b9d90d4c2878cb88a2159265ad0a96703bd6995eed7063a5bfb8ddabd920b8b9
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.696Z
---

# useTerminalBulletins.ts

**Path:** `src/hooks/useTerminalBulletins.ts`
**Lines:** 159
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useTerminalBulletins` | function | `(route: Route): { bulletins: {}; activeAlert: any; isLoading: false; error: any; }` |
| `ProcessedBulletin` | interface |  |

## Imports

**Internal:**
- `../api/terminals` (`fetchTerminalBulletins`)
- `../api/types` (`TerminalBulletin`)
- `../utils/constants` (`ROUTES`, `Route`)

**External:**
- `@tanstack/react-query` (`useQuery`)
