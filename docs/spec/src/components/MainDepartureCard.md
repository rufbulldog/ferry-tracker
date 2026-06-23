---
type: l1-file
spec_version: 1
source: src/components/MainDepartureCard.tsx
content_sha: 4fe333522280aad69e24a6d53c130fc6b870b4a8fbdfe3339323cb7df93b2654
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.643Z
---

# MainDepartureCard.tsx

**Path:** `src/components/MainDepartureCard.tsx`
**Lines:** 822
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
- `react` (`default as React`, `useEffect`, `useRef`, `useState`, `useCallback`)
- `react-native` (`View`, `StyleSheet`, `Animated`, `Dimensions`, `TouchableOpacity`, `Image`, `ActivityIndicator`, `PanResponder`)
- `react-native-paper` (`Text`)
