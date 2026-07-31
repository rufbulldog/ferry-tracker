---
type: l1-file
spec_version: 1
source: src/hooks/useTerminalBulletins.ts
content_sha: 32a109ddb6ef53b9263f0b3904a71c4ff8ce305c94d0e397568d894129c0a057
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-07-31T23:25:27.501Z
---

# useTerminalBulletins.ts

**Path:** `src/hooks/useTerminalBulletins.ts`
**Lines:** 164
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
