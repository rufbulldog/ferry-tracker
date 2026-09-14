---
type: l1-file
spec_version: 1
source: app/planner.tsx
content_sha: 84f94d1daab4c7ee824eb12ad6a7aec04427eac0c6d3b0b318f6d08e993ddbe2
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-09-14T02:10:09.278Z
---

# planner.tsx

**Path:** `app/planner.tsx`
**Lines:** 281
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `default` | default | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@types/react/index").JSX.Element` |

## Imports

**Internal:**
- `../src/components/MonthCalendar` (`MonthCalendar`)
- `../src/context/RouteContext` (`useRoute`)
- `../src/context/ThemeContext` (`useTheme`)
- `../src/hooks/useDailyTrends` (`useRecentTrends`)
- `../src/hooks/useFutureSchedule` (`useFutureSchedule`, `useValidDateRange`)
- `../src/hooks/useTransitRecords` (`useTransitRecords`)
- `../src/types/storage` (`Vehicle`)
- `../src/utils/constants` (`ROUTES`)
- `../src/utils/dateHelpers` (`toYMD`, `addDays`, `startOfDay`, `isSameDay`, `formatDayLabel`, `daysBetween`)
- `../src/utils/planEstimate` (`computePlanEstimate`)
- `../src/utils/time` (`formatTime`)
- `../src/utils/transitConfig` (`TRAVEL_TIMES`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `expo-router` (`useRouter`)
- `react` (`useMemo`, `useState`)
- `react-native` (`View`, `StyleSheet`, `ScrollView`, `TouchableOpacity`, `Modal`, `Pressable`)
- `react-native-paper` (`Text`, `ActivityIndicator`)
- `react-native-safe-area-context` (`useSafeAreaInsets`)
