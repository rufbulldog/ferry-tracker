---
type: l1-file
spec_version: 1
source: app/(tabs)/index.tsx
content_sha: fb9dfc6d71e69cff28a9c42776c7891668856edb316948b71d452b0ea5914cee
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:33:00.921Z
---

# index.tsx

**Path:** `app/(tabs)/index.tsx`
**Lines:** 700
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
- `../../src/context/BestSailingContext` (`useBestSailingContext`)
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
