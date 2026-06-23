---
type: l1-file
spec_version: 1
source: src/components/FerryCard.tsx
content_sha: d4ada51ba5f625987a15a51e97057cf16d99b03c006810c1581442ad5149a66f
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.642Z
---

# FerryCard.tsx

**Path:** `src/components/FerryCard.tsx`
**Lines:** 295
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `FerryCard` | function | `({ departure, isMainCard = false, }: FerryCardProps): any` |

## Imports

**Internal:**
- `../context/ThemeContext` (`useTheme`)
- `../hooks/useNextDepartures` (`DepartureInfo`)
- `../utils/time` (`formatTime`, `parseDate`, `getMinutesUntil`)
- `./CapacityBar` (`CapacityBar`)
- `./FerryProgressIndicator` (`FerryProgressIndicator`)

**External:**
- `react` (`default as React`)
- `react-native` (`View`, `StyleSheet`)
- `react-native-paper` (`Card`, `Text`)
