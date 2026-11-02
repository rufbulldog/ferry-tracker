---
type: l1-file
spec_version: 1
source: src/hooks/useLiveActivity.ts
content_sha: b3cb6e16b6558a8fc899f9033e6a1c4254e8c3a09da2bf2af00b2e3da7f8fb32
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:33:00.968Z
---

# useLiveActivity.ts

**Path:** `src/hooks/useLiveActivity.ts`
**Lines:** 100
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `toLiveState` | function | `(best: SailingPick<DepartureInfo>, alt: SailingPick<DepartureInfo> \| undefined): FerryLiveState` |
| `useLiveActivity` | function | `(state: FerryLiveState \| null): { supported: boolean; active: boolean; toggle: () => void; }` |
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
- `../utils/time` (`formatTime`)
- `./useNextDepartures` (`DepartureInfo`)

**External:**
- `react` (`useCallback`, `useEffect`, `useMemo`, `useRef`, `useState`)
