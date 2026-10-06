---
type: l1-file
spec_version: 1
source: src/components/MainDepartureCard.tsx
content_sha: 77a619348cc5168b7f2a2d45082db3b2d2f5ab7f4f5e0dfb3f9f35b8c5c43ec5
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-10-06T07:24:46.181Z
---

# MainDepartureCard.tsx

**Path:** `src/components/MainDepartureCard.tsx`
**Lines:** 711
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `MainDepartureCard` | function | `({ departure, terminalId, terminalName, isAnimatingOut = false, height = SCREEN_HEIGHT * 0.5 }: MainDepartureCardProps): any` |

## Imports

**Internal:**
- `../context/ThemeContext` (`useTheme`)
- `../hooks/useNextDepartures` (`DepartureInfo`)
- `../utils/constants` (`TERMINAL_CAMERAS`)
- `../utils/ferryDeparture` (`effectiveFerryDeparture`)
- `../utils/time` (`formatTime`, `getMinutesUntil`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `react` (`default as React`, `useEffect`, `useMemo`, `useState`, `useCallback`)
- `react-native` (`View`, `StyleSheet`, `Animated`, `Dimensions`, `TouchableOpacity`, `Image`, `ActivityIndicator`, `PanResponder`)
- `react-native-paper` (`Text`)
