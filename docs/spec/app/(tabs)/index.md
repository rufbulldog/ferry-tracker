---
type: l1-file
spec_version: 1
source: app/(tabs)/index.tsx
content_sha: a41d6ca8b6d89b5b8b5f041a36a71a0262bca0abefbedc8bed543d25b9772cd6
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T08:06:25.397Z
---

# index.tsx

**Path:** `app/(tabs)/index.tsx`
**Lines:** 593
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
- `@react-native-async-storage/async-storage` (`default as AsyncStorage`)
- `@tanstack/react-query` (`useQueryClient`)
- `react` (`useState`, `useCallback`, `useMemo`, `useRef`, `useEffect`)
- `react-native` (`View`, `StyleSheet`, `ScrollView`, `RefreshControl`, `Animated`)
- `react-native-paper` (`Text`, `Card`, `ActivityIndicator`)
