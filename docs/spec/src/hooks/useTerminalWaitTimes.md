---
type: l1-file
spec_version: 1
source: src/hooks/useTerminalWaitTimes.ts
content_sha: 00e5e1f9e113d333983edbdc9792d5be356082738c2d8dd50e9f1bdcc239404b
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.631Z
---

# useTerminalWaitTimes.ts

**Path:** `src/hooks/useTerminalWaitTimes.ts`
**Lines:** 29
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useTerminalWaitTimes` | function | `(terminalId: number): { notes: any; }` |

### Documented exports

- **`useTerminalWaitTimes`** — WSF vehicle wait-time notes for a terminal. The `/wsf/waittimes/{id}` proxy

## Imports

**Internal:**
- `../api/terminals` (`fetchTerminalWaitTimes`)
- `../api/types` (`WaitTime`)

**External:**
- `@tanstack/react-query` (`useQuery`)
