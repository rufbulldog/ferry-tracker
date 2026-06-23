---
type: l1-file
spec_version: 1
source: app/(tabs)/trends.tsx
content_sha: 5b80a75ac0a20b59d3385f62220687f8d3f531929c0a29c83bdff98be59b5e22
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.627Z
---

# trends.tsx

**Path:** `app/(tabs)/trends.tsx`
**Lines:** 561
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `default` | default | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@types/react/index").JSX.Element` |

## Imports

**Internal:**
- `../../src/context/RouteContext` (`useRoute`)
- `../../src/context/ThemeContext` (`useTheme`)
- `../../src/hooks/useDailyTrends` (`useTodayTrends`, `useRecentTrends`, `getHourlyDelays`, `getDailyDelays`, `getHourlyCapacities`, `calculateAverageDelay`, `calculateAverageCapacity`)
- `../../src/hooks/useTransitRecords` (`useAllTransitAverages`, `TransitAverage`)
- `../../src/types/storage` (`TransitRoute`, `Vehicle`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `react` (`useMemo`, `useRef`, `useEffect`)
- `react-native` (`View`, `StyleSheet`, `ScrollView`, `useWindowDimensions`, `Dimensions`, `Animated`)
- `react-native-gifted-charts` (`LineChart`, `BarChart`)
- `react-native-paper` (`Text`)
