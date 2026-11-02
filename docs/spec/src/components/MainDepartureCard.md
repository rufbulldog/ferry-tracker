---
type: l1-file
spec_version: 1
source: src/components/MainDepartureCard.tsx
content_sha: 8372e4032cb5939459861bc4684c7aa655348a2e84ef3e313d3335258f5f4b85
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T08:06:25.420Z
---

# MainDepartureCard.tsx

**Path:** `src/components/MainDepartureCard.tsx`
**Lines:** 772
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `MainDepartureCard` | function | `({ departure, terminalId, terminalName, isAnimatingOut = false, plan, departed, departedCapacityPercent, reasoning, }: MainDepartureCardProps): any` |
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
- `./DepartedStrip` (`DepartedStrip`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `react` (`default as React`, `useMemo`, `useState`, `useCallback`)
- `react-native` (`View`, `StyleSheet`, `Animated`, `TouchableOpacity`, `Image`, `ActivityIndicator`, `PanResponder`)
- `react-native-paper` (`Text`)
