---
type: l1-file
spec_version: 1
source: src/hooks/useTerminalBulletins.ts
content_sha: f646cb214661ab07bcbca8abbf575f2e6d2e3956929e6b58dc65a15f8b8dfdbe
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T02:40:10.690Z
---

# useTerminalBulletins.ts

**Path:** `src/hooks/useTerminalBulletins.ts`
**Lines:** 30
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useTerminalBulletins` | function | `(route: Route): { bulletins: {}; activeAlert: import("/Users/brandontaylor/Coding/ferry-app/src/utils/bulletins").ProcessedBulletin; isLoading: false; error: any; }` |
| `ProcessedBulletin` | interface |  |

## Imports

**Internal:**
- `../api/terminals` (`fetchTerminalBulletins`)
- `../utils/bulletins` (`processBulletins`, `pickActiveAlert`)
- `../utils/constants` (`ROUTES`, `Route`)

**External:**
- `@tanstack/react-query` (`useQuery`)
