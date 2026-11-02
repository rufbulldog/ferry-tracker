---
type: l1-file
spec_version: 1
source: src/context/BestSailingContext.tsx
content_sha: fbb43c7b7b622f41c255d58bd2215fd08b40b6d6e36beb9c8015bcc6a23bf2c1
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T04:30:53.404Z
---

# BestSailingContext.tsx

**Path:** `src/context/BestSailingContext.tsx`
**Lines:** 110
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `BestSailingProvider` | function | `({ children }: { children: ReactNode }): any` |
| `useBestSailingContext` | function | `(): BestSailingContextValue` |
| `LiveSource` | interface |  |
| `BestSailingContextValue` | interface |  |

### Documented exports

- **`LiveSource`** — A plan for the Live Activity, and whether it's a drive (spots once under way).

## Imports

**Internal:**
- `../../modules/ferry-live` (`FerryLive`, `FerryLiveState`)
- `../hooks/useBestSailing` (`useBestSailing`, `BestSailingState`)
- `../hooks/useLiveActivity` (`toLiveState`, `useCarPlaySnapshot`, `useLiveActivity`)
- `../utils/bestSailing` (`driveAroundWins`)
- `../utils/time` (`formatTime`)

**External:**
- `@tanstack/react-query` (`useQueryClient`)
- `react` (`default as React`, `createContext`, `useCallback`, `useContext`, `useEffect`, `useMemo`, `useState`, `ReactNode`)
