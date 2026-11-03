---
type: l1-file
spec_version: 1
source: src/hooks/useLiveActivity.ts
content_sha: 544d08b8fce8eb3b9e3fc7575855ce96716a745cbc37cf06a67fdc5c42ea4bcd
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-03T05:46:28.312Z
---

# useLiveActivity.ts

**Path:** `src/hooks/useLiveActivity.ts`
**Lines:** 117
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
