---
type: l1-file
spec_version: 1
source: src/components/BestSailingCard.tsx
content_sha: 098adf560c8579ca28a67644e1da5d4f2d2c3e6549d5ba22b82716c0649b1b31
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:53:15.226Z
---

# BestSailingCard.tsx

**Path:** `src/components/BestSailingCard.tsx`
**Lines:** 155
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
- `./LiveActivityPill` (`LiveActivityPill`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `react` (`default as React`)
- `react-native` (`View`, `StyleSheet`, `TouchableOpacity`)
- `react-native-paper` (`Text`)
