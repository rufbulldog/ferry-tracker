---
type: l1-file
spec_version: 1
source: src/components/DepartedStrip.tsx
content_sha: 63607f73c30cf4ee0e9d18e102619f0617fd489205d1d3bad3d47c21b645087f
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T08:06:25.419Z
---

# DepartedStrip.tsx

**Path:** `src/components/DepartedStrip.tsx`
**Lines:** 122
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `DepartedStrip` | function | `({ departure, backendCapacityPercent, }: { departure: DepartureInfo; backendCapacityPercent?: number \| null; }): any` |

### Documented exports

- **`DepartedStrip`** — The boat that just left, as one line at the foot of the Next Sailing card:

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
