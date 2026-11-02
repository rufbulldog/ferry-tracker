---
type: l1-file
spec_version: 1
source: src/context/BestSailingContext.tsx
content_sha: 35069009e7d18149d53ad4e16d37763397ade032034f3c7bb51b3886c0d6c48e
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:33:00.944Z
---

# BestSailingContext.tsx

**Path:** `src/context/BestSailingContext.tsx`
**Lines:** 61
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `BestSailingProvider` | function | `({ children }: { children: ReactNode }): any` |
| `useBestSailingContext` | function | `(): BestSailingContextValue` |
| `BestSailingContextValue` | interface |  |

## Imports

**Internal:**
- `../../modules/ferry-live` (`FerryLiveState`)
- `../hooks/useBestSailing` (`useBestSailing`, `BestSailingState`)
- `../hooks/useLiveActivity` (`toLiveState`, `useCarPlaySnapshot`, `useLiveActivity`)

**External:**
- `react` (`default as React`, `createContext`, `useCallback`, `useContext`, `useMemo`, `useState`, `ReactNode`)
