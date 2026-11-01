---
type: l1-file
spec_version: 1
source: src/hooks/useLiveActivity.ts
content_sha: 4bad820b2913f70e42425a21896f1317e8cb7337507306b086e46d533d7ecb5d
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-01T19:07:47.864Z
---

# useLiveActivity.ts

**Path:** `src/hooks/useLiveActivity.ts`
**Lines:** 107
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `toLiveState` | function | `(best: SailingPick<DepartureInfo>, alt: SailingPick<DepartureInfo> \| undefined): FerryLiveState` |
| `useLiveActivity` | function | `(best: SailingPick<DepartureInfo> \| null, alt: SailingPick<DepartureInfo> \| undefined): { supported: boolean; active: boolean; toggle: () => void; }` |
| `toCarPlaySnapshot` | function | `(hasLocation: boolean, { best, alternatives }: BestSailingResult<DepartureInfo>): CarPlaySnapshot` |
| `useCarPlaySnapshot` | function | `(hasLocation: boolean, result: BestSailingResult<DepartureInfo>): void` |

### Documented exports

- **`useLiveActivity`** — Mirror the best-sailing plan into a Live Activity (Lock Screen, Dynamic
- **`useCarPlaySnapshot`** — Keep the CarPlay screen's snapshot current. Always on (it's in-process and

## Imports

**Internal:**
- `../../modules/ferry-live` (`CarPlaySnapshot`, `FerryLive`, `FerryLiveState`)
- `../utils/bestSailing` (`BestSailingResult`, `SailingPick`)
- `../utils/constants` (`ROUTES`)
- `../utils/time` (`formatTime`)
- `./useNextDepartures` (`DepartureInfo`)

**External:**
- `react` (`useCallback`, `useEffect`, `useMemo`, `useRef`, `useState`)
