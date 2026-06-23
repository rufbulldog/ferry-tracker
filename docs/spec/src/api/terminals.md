---
type: l1-file
spec_version: 1
source: src/api/terminals.ts
content_sha: b2b926e0de0ae38c0b76befabe20a789cfb8329686e1aa42914b0a4bb3f0cecd
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.640Z
---

# terminals.ts

**Path:** `src/api/terminals.ts`
**Lines:** 13
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `fetchTerminalSailingSpace` | function | `(): Promise<TerminalSailingSpace[]>` |
| `fetchTerminalBulletins` | function | `(terminalId: number): Promise<TerminalBulletins>` |

## Imports

**Internal:**
- `./client` (`terminalsApi`)
- `./types` (`TerminalSailingSpace`, `TerminalBulletins`)
