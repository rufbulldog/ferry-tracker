---
type: l1-file
spec_version: 1
source: app/(tabs)/timer.tsx
content_sha: 6c38437dd06f261c3560560e51c5d539bb5116722b00bc8b88b34a64e41331b2
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T04:57:17.724Z
---

# timer.tsx

**Path:** `app/(tabs)/timer.tsx`
**Lines:** 618
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `default` | default | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@types/react/index").JSX.Element` |

## Imports

**Internal:**
- `../../src/components/CarMeter` (`CarMeter`)
- `../../src/context/ThemeContext` (`useTheme`)
- `../../src/hooks/useNextDepartures` (`useNextDepartures`)
- `../../src/hooks/useTimer` (`useTimer`)
- `../../src/hooks/useTransitRecords` (`useTransitRecords`, `useRecentTransitRecords`, `useSaveTransitRecord`, `useDeleteTransitRecord`)
- `../../src/hooks/useUserLocation` (`useUserLocation`)
- `../../src/types/storage` (`TransitRecord`, `Vehicle`)
- `../../src/utils/ferryDeparture` (`effectiveFerryDeparture`)
- `../../src/utils/locations` (`findNearestLocation`, `getTimerRouteDefault`)
- `../../src/utils/time` (`formatTime`)
- `../../src/utils/timerLegs` (`TIMER_LEGS`, `TimerLegId`, `currentPeriod`, `formatClock`, `formatMinSec`, `getLeg`, `legStats`, `paceAgainstTypical`, `recordLabel`, `sailingOnPaceFor`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `react` (`useState`, `useEffect`, `useRef`, `useMemo`)
- `react-native` (`View`, `StyleSheet`, `ScrollView`, `Alert`, `TouchableOpacity`, `Modal`, `Pressable`)
- `react-native-paper` (`Text`)
- `react-native-safe-area-context` (`useSafeAreaInsets`)
