---
type: l1-file
spec_version: 1
source: src/components/LastDepartureCard.tsx
content_sha: 0cd252a943123cda82784e1b5f455f135be77dabab382246fb9fcbd83ee36fd7
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T04:57:17.742Z
---

# LastDepartureCard.tsx

**Path:** `src/components/LastDepartureCard.tsx`
**Lines:** 175
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `LastDepartureCard` | function | `({ departure, backendCapacityPercent }: LastDepartureCardProps): any` |

## Imports

**Internal:**
- `../context/ThemeContext` (`useTheme`)
- `../hooks/useNextDepartures` (`DepartureInfo`)
- `../utils/ferryDeparture` (`effectiveFerryDeparture`)
- `../utils/time` (`formatTime`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `react` (`default as React`, `useEffect`, `useState`)
- `react-native` (`View`, `StyleSheet`, `Animated`)
- `react-native-paper` (`Text`)
