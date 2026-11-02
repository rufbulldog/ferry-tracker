---
type: l1-file
spec_version: 1
source: src/hooks/useLiveActivity.ts
content_sha: 1fec22aecc3969e852cb2e379791405682135fd6025fa20f5c0a542dd5c8db72
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T04:30:53.428Z
---

# useLiveActivity.ts

**Path:** `src/hooks/useLiveActivity.ts`
**Lines:** 116
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `toLiveState` | function | `(best: SailingPick<DepartureInfo>, alt: SailingPick<DepartureInfo> \| undefined): FerryLiveState` |
| `useLiveActivity` | function | `(source: { state: FerryLiveState; car: boolean } \| null, nowMs: number): { supported: boolean; active: boolean; toggle: () => void; }` |
| `toCarPlaySnapshot` | function | `(hasLocation: boolean, { best, alternatives }: BestSailingResult<DepartureInfo>): CarPlaySnapshot` |
| `useCarPlaySnapshot` | function | `(hasLocation: boolean, result: BestSailingResult<DepartureInfo>): void` |

### Documented exports

- **`useLiveActivity`** — Mirror a plan into a Live Activity (Lock Screen, Dynamic Island, and the
- **`useCarPlaySnapshot`** — Keep the CarPlay screen's snapshot current. Always on (it's in-process and

## Imports

**Internal:**
- `../../modules/ferry-live` (`CarPlaySnapshot`, `FerryLive`, `FerryLiveState`)
- `../utils/bestSailing` (`BestSailingResult`, `SailingPick`)
- `../utils/constants` (`ROUTES`)
- `../utils/liveSpots` (`withEnRoute`)
- `../utils/time` (`formatTime`)
- `./useNextDepartures` (`DepartureInfo`)

**External:**
- `react` (`useCallback`, `useEffect`, `useMemo`, `useRef`, `useState`)
