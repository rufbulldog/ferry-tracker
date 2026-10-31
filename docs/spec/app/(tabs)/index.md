---
type: l1-file
spec_version: 1
source: app/(tabs)/index.tsx
content_sha: ca5a825f75c93fb31bd597c6594933b77d99d97517ee73e593203d705fdd5d85
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-10-31T07:21:21.438Z
---

# index.tsx

**Path:** `app/(tabs)/index.tsx`
**Lines:** 558
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `default` | default | `(): import("/home/user/ferry-tracker/node_modules/@types/react/index").JSX.Element` |

## Imports

**Internal:**
- `../../src/components/AlertBanner` (`AlertBanner`)
- `../../src/components/CarWaitChip` (`CarWaitChip`)
- `../../src/components/CheckInFAB` (`CheckInFAB`)
- `../../src/components/FerryCard` (`FerryCard`)
- `../../src/components/KingstonBoardingPassPill` (`KingstonBoardingPassPill`)
- `../../src/components/LastDepartureCard` (`LastDepartureCard`)
- `../../src/components/MainDepartureCard` (`MainDepartureCard`, `DeparturePlan`)
- `../../src/context/RouteContext` (`useRoute`)
- `../../src/context/ThemeContext` (`useTheme`)
- `../../src/hooks/useArrivalEta` (`usePlannedArrival`)
- `../../src/hooks/useLatestDeparture` (`useLatestDeparturePair`)
- `../../src/hooks/useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `../../src/hooks/useRecommendation` (`useRecommendation`)
- `../../src/hooks/useTerminalBulletins` (`useTerminalBulletins`)
- `../../src/types/storage` (`Vehicle`)
- `../../src/utils/constants` (`ROUTES`, `TERMINALS`)
- `../../src/utils/time` (`formatTime`)
- `../../src/utils/transitConfig` (`TRAVEL_TIMES`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `@react-native-async-storage/async-storage` (`default as AsyncStorage`)
- `@tanstack/react-query` (`useQueryClient`)
- `react` (`useState`, `useCallback`, `useMemo`, `useRef`, `useEffect`)
- `react-native` (`View`, `StyleSheet`, `ScrollView`, `RefreshControl`, `Animated`, `TouchableOpacity`, `LayoutChangeEvent`)
- `react-native-paper` (`Text`, `Card`, `ActivityIndicator`)
