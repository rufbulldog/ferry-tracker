---
type: l1-file
spec_version: 1
source: src/hooks/useTimer.ts
content_sha: 483dfe2e134fbb839dd2a92cb12afefefddedd63c18f50248f33f73f171c7f2c
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.702Z
---

# useTimer.ts

**Path:** `src/hooks/useTimer.ts`
**Lines:** 198
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useTimer` | function | `(): { elapsedSeconds: number; isRunning: boolean; isPaused: boolean; formattedTime: string; start: () => void; stop: () => void; reset: () => void; resume: () => void; }` |
| `TimerState` | interface |  |

## Imports

**External:**
- `@react-native-async-storage/async-storage` (`default as AsyncStorage`)
- `react` (`useState`, `useEffect`, `useRef`, `useCallback`)
- `react-native` (`AppState`, `AppStateStatus`)
