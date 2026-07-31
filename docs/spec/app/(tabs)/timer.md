---
type: l1-file
spec_version: 1
source: app/(tabs)/timer.tsx
content_sha: 9dcf043fa3ee607c8099030dce719ed800c1accb1af0edbfe11f0ed7f721d217
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-07-31T23:25:27.460Z
---

# timer.tsx

**Path:** `app/(tabs)/timer.tsx`
**Lines:** 545
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `default` | default | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@types/react/index").JSX.Element` |

## Imports

**Internal:**
- `../../src/context/ThemeContext` (`useTheme`)
- `../../src/hooks/useTimer` (`useTimer`)
- `../../src/hooks/useTransitRecords` (`useRecentTransitRecords`, `useSaveTransitRecord`, `useDeleteTransitRecord`)
- `../../src/hooks/useUserLocation` (`useUserLocation`)
- `../../src/types/storage` (`TransitRoute`, `Vehicle`)
- `../../src/utils/locations` (`findNearestLocation`, `getTimerRouteDefault`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `react` (`useState`, `useEffect`, `useRef`)
- `react-native` (`View`, `StyleSheet`, `ScrollView`, `Alert`, `TouchableOpacity`, `Modal`, `Pressable`, `Dimensions`)
- `react-native-paper` (`Text`, `IconButton`)
- `react-native-safe-area-context` (`useSafeAreaInsets`)
