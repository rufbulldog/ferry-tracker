---
type: l1-file
spec_version: 1
source: src/utils/bulletins.ts
content_sha: 5bb77764c57dc36ef512ab12b1f137289299acd6476e3d2ac55167eff537823f
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T02:40:10.719Z
---

# bulletins.ts

**Path:** `src/utils/bulletins.ts`
**Lines:** 156
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `processBulletins` | function | `(raw: TerminalBulletin[] \| undefined, route: string, now: Date = new Date()): ProcessedBulletin[]` |
| `pickActiveAlert` | function | `(bulletins: ProcessedBulletin[]): ProcessedBulletin \| null` |
| `ProcessedBulletin` | interface |  |

### Documented exports

- **`processBulletins`** — Route-relevant bulletins, alerts first then newest. `route` is matched by the
- **`pickActiveAlert`** — The most important alert: route-specific and recent first, then any recent alert.

## Imports

**Internal:**
- `../api/types` (`TerminalBulletin`)
