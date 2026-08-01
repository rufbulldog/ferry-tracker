---
type: l1-file
spec_version: 1
source: src/components/ArrivingCard.tsx
content_sha: d59ed1e9e8b87f57f2a0e45ba86e049a462504c4620b2c0903c91789c1fe6315
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.580Z
---

# ArrivingCard.tsx

**Path:** `src/components/ArrivingCard.tsx`
**Lines:** 183
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `ArrivingCard` | function | `({ departure, backendIncomingCapacity }: ArrivingCardProps): any` |

### Documented exports

- **`ArrivingCard`** — Compact tracker for the incoming vessel, pulled out of the Next Sailing card

## Imports

**Internal:**
- `../context/ThemeContext` (`useTheme`)
- `../hooks/useNextDepartures` (`DepartureInfo`)
- `../utils/time` (`formatTime`, `getMinutesUntil`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `react` (`default as React`, `useEffect`, `useState`)
- `react-native` (`View`, `StyleSheet`, `Animated`)
- `react-native-paper` (`Text`)
