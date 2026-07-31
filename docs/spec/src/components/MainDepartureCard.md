---
type: l1-file
spec_version: 1
source: src/components/MainDepartureCard.tsx
content_sha: cb73642f52e95697724b6bc07f91d5afc75ee2038d7c974ab35fa96f5b182dad
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-07-31T23:25:27.475Z
---

# MainDepartureCard.tsx

**Path:** `src/components/MainDepartureCard.tsx`
**Lines:** 818
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `MainDepartureCard` | function | `({ departure, terminalId, terminalName, isAnimatingOut = false, backendIncomingCapacity }: MainDepartureCardProps): any` |

## Imports

**Internal:**
- `../context/ThemeContext` (`useTheme`)
- `../hooks/useNextDepartures` (`DepartureInfo`)
- `../utils/constants` (`TERMINAL_CAMERAS`)
- `../utils/time` (`formatTime`, `getMinutesUntil`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `react` (`default as React`, `useEffect`, `useMemo`, `useState`, `useCallback`)
- `react-native` (`View`, `StyleSheet`, `Animated`, `Dimensions`, `TouchableOpacity`, `Image`, `ActivityIndicator`, `PanResponder`)
- `react-native-paper` (`Text`)
