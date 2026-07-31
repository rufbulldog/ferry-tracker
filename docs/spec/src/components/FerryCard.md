---
type: l1-file
spec_version: 1
source: src/components/FerryCard.tsx
content_sha: de1fe3e71bd377e62f7a5cb2951696b24dff302188317644dd992d3dc90928a2
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-07-31T23:25:27.474Z
---

# FerryCard.tsx

**Path:** `src/components/FerryCard.tsx`
**Lines:** 297
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
