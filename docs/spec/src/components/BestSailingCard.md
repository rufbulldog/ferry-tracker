---
type: l1-file
spec_version: 1
source: src/components/BestSailingCard.tsx
content_sha: 9a4059e5d51028aaf52fe6d3451b6f183c4e569b8b07c0397fa3c770e0fa5158
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T08:06:25.416Z
---

# BestSailingCard.tsx

**Path:** `src/components/BestSailingCard.tsx`
**Lines:** 220
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `BestSailingCard` | function | `(): any` |

### Documented exports

- **`BestSailingCard`** — "Best from here" — which terminal to drive to and which sailing you can make,

## Imports

**Internal:**
- `../context/BestSailingContext` (`useBestSailingContext`)
- `../context/RouteContext` (`useRoute`)
- `../context/ThemeContext` (`useTheme`)
- `../utils/bestSailing` (`driveAroundWins`)
- `../utils/constants` (`ROUTES`)
- `../utils/routeGroups` (`selectionFor`)
- `../utils/time` (`formatTime`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `react` (`default as React`, `useState`)
- `react-native` (`View`, `StyleSheet`, `TouchableOpacity`)
- `react-native-paper` (`Text`)
