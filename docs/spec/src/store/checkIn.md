---
type: l1-file
spec_version: 1
source: src/store/checkIn.ts
content_sha: 2d397ef20fb38522961afcecf428bddd338590a431f969b1a825678bf039e745
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.649Z
---

# checkIn.ts

**Path:** `src/store/checkIn.ts`
**Lines:** 48
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `getCheckIn` | function | `(): CheckIn \| null` |
| `setCheckIn` | function | `(next: CheckIn): void` |
| `clearCheckIn` | function | `(): void` |
| `subscribeCheckIn` | function | `(fn: () => void): () => void` |
| `CheckIn` | interface |  |

### Documented exports

- **`CheckIn`** — Session "I'm aboard" pin. Pressing Send ETA records which sailing the user is

## Imports

**Internal:**
- `../utils/constants` (`Route`)
