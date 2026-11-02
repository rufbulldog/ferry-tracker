---
type: l1-file
spec_version: 1
source: src/utils/liveSpots.ts
content_sha: 9bbe4234e4df6b955131992ca2d1f2b91fa099bba522be5cbe24a325ee967180
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T04:30:53.460Z
---

# liveSpots.ts

**Path:** `src/utils/liveSpots.ts`
**Lines:** 34
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `withEnRoute` | function | `(source: { state: FerryLiveState; car: boolean }, nowMs: number, liveOn: boolean, alreadyEnRoute: boolean, startSpaces: Map<number, number>): FerryLiveState` |
| `LEAVE_NOW_MS` | const | `60_000` |

## Imports

**Internal:**
- `../../modules/ferry-live` (`FerryLiveState`)
