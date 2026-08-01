---
type: l1-file
spec_version: 1
source: src/components/LastDepartureCard.tsx
content_sha: a6b2f74ff2811fa47c1f83055bba793cfa8916bbdf6b72f842b53342135dae9b
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.586Z
---

# LastDepartureCard.tsx

**Path:** `src/components/LastDepartureCard.tsx`
**Lines:** 163
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
