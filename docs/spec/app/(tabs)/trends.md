---
type: l1-file
spec_version: 1
source: app/(tabs)/trends.tsx
content_sha: 1f403765939cfd3e198e114945d11b5dad59bce2b8c3e66305eff3d4d1dc325c
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-07-31T23:25:27.462Z
---

# trends.tsx

**Path:** `app/(tabs)/trends.tsx`
**Lines:** 558
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
- `../../src/hooks/useTransitRecords` (`useAllTransitAverages`)
- `../../src/types/storage` (`TransitRoute`, `Vehicle`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `react` (`useMemo`, `useState`, `useEffect`)
- `react-native` (`View`, `StyleSheet`, `ScrollView`, `useWindowDimensions`, `Animated`)
- `react-native-gifted-charts` (`LineChart`, `BarChart`)
- `react-native-paper` (`Text`)
