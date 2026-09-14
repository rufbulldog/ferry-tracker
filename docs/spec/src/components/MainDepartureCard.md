---
type: l1-file
spec_version: 1
source: src/components/MainDepartureCard.tsx
content_sha: 941a1cb4cb5c680b44d17d7565371f199a477983c8e272532bccf7d6dd5e5db0
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-09-14T02:10:09.294Z
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
