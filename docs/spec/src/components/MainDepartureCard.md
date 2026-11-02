---
type: l1-file
spec_version: 1
source: src/components/MainDepartureCard.tsx
content_sha: a706007d049ed9261464f0d53fdbc4a2d861a529f654ea2893d35a7cf9cf5a53
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T04:57:17.744Z
---

# MainDepartureCard.tsx

**Path:** `src/components/MainDepartureCard.tsx`
**Lines:** 703
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `MainDepartureCard` | function | `({ departure, terminalId, terminalName, isAnimatingOut = false, plan }: MainDepartureCardProps): any` |
| `DeparturePlan` | interface |  |

### Documented exports

- **`DeparturePlan`** — The leave-by plan for this sailing (formerly the Leave tab).

## Imports

**Internal:**
- `../context/ThemeContext` (`useTheme`)
- `../hooks/useNextDepartures` (`DepartureInfo`)
- `../types/storage` (`Vehicle`)
- `../utils/arrivalPlan` (`ArrivalEta`)
- `../utils/capacityMeter` (`CAPACITY_TONE_LABEL`, `capacityTone`, `carsPerBar`, `percentFull`)
- `../utils/constants` (`TERMINAL_CAMERAS`)
- `../utils/ferryDeparture` (`effectiveFerryDeparture`)
- `../utils/time` (`formatTime`, `getMinutesUntil`)
- `./CarMeter` (`CarMeter`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `react` (`default as React`, `useMemo`, `useState`, `useCallback`)
- `react-native` (`View`, `StyleSheet`, `Animated`, `TouchableOpacity`, `Image`, `ActivityIndicator`, `PanResponder`)
- `react-native-paper` (`Text`)
