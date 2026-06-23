---
type: l1-file
spec_version: 1
source: app/(tabs)/timer.tsx
content_sha: 34c2cc30f83a2d9be9ac7630c2607ce51c6d46568d0eb312ee377d4e8717c271
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.625Z
---

# timer.tsx

**Path:** `app/(tabs)/timer.tsx`
**Lines:** 541
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
