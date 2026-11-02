---
type: l1-file
spec_version: 1
source: app/(tabs)/index.tsx
content_sha: a55ed17cfff72f1db9b6329a4bfac62bedcce2c4777226d44a5ec052f382eb12
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T04:30:53.381Z
---

# index.tsx

**Path:** `app/(tabs)/index.tsx`
**Lines:** 712
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `default` | default | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@types/react/index").JSX.Element` |

## Imports

**Internal:**
- `../../modules/ferry-live` (`FerryLiveState`)
- `../../src/components/AlertBanner` (`AlertBanner`)
- `../../src/components/BestSailingCard` (`BestSailingCard`)
- `../../src/components/CarWaitChip` (`CarWaitChip`)
- `../../src/components/CheckInFAB` (`CheckInFAB`)
- `../../src/components/FerryCard` (`FerryCard`)
- `../../src/components/KingstonBoardingPassPill` (`KingstonBoardingPassPill`)
- `../../src/components/LastDepartureCard` (`LastDepartureCard`)
- `../../src/components/LiveActivityPill` (`LiveActivityPill`)
- `../../src/components/MainDepartureCard` (`MainDepartureCard`, `DeparturePlan`)
- `../../src/context/BestSailingContext` (`useBestSailingContext`, `LiveSource`)
- `../../src/context/RouteContext` (`useRoute`)
- `../../src/context/ThemeContext` (`useTheme`)
- `../../src/hooks/useArrivalEta` (`usePlannedArrival`)
- `../../src/hooks/useLatestDeparture` (`useLatestDeparturePair`)
- `../../src/hooks/useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `../../src/hooks/useRecommendation` (`useRecommendation`)
- `../../src/hooks/useTerminalBulletins` (`useTerminalBulletins`)
- `../../src/types/storage` (`Vehicle`)
- `../../src/utils/constants` (`ROUTES`, `TERMINALS`, `crossingMinutesForRoute`)
- `../../src/utils/time` (`formatTime`)
- `../../src/utils/transitConfig` (`TRAVEL_TIMES`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `@react-native-async-storage/async-storage` (`default as AsyncStorage`)
- `@tanstack/react-query` (`useQueryClient`)
- `react` (`useState`, `useCallback`, `useMemo`, `useRef`, `useEffect`)
- `react-native` (`View`, `StyleSheet`, `ScrollView`, `RefreshControl`, `Animated`, `TouchableOpacity`, `LayoutChangeEvent`)
- `react-native-paper` (`Text`, `Card`, `ActivityIndicator`)
