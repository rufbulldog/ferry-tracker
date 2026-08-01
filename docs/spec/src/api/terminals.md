---
type: l1-file
spec_version: 1
source: src/api/terminals.ts
content_sha: 0a510d226e9daf1a5d67a6e0b8d2beaf0ff2f6e16068a1d00e93224dc2e1ced9
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.578Z
---

# terminals.ts

**Path:** `src/api/terminals.ts`
**Lines:** 18
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `fetchTerminalSailingSpace` | function | `(): Promise<TerminalSailingSpace[]>` |
| `fetchTerminalBulletins` | function | `(terminalId: number): Promise<TerminalBulletins>` |
| `fetchTerminalWaitTimes` | function | `(terminalId: number): Promise<TerminalWaitTimes>` |

## Imports

**Internal:**
- `./client` (`terminalsApi`)
- `./types` (`TerminalSailingSpace`, `TerminalBulletins`, `TerminalWaitTimes`)
