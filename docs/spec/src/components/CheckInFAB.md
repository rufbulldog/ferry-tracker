---
type: l1-file
spec_version: 1
source: src/components/CheckInFAB.tsx
content_sha: c9df2b6c0019bae7be52bfb4b60c485e9e8c5d30a7fea4b2ee7a81a351d12312
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.582Z
---

# CheckInFAB.tsx

**Path:** `src/components/CheckInFAB.tsx`
**Lines:** 105
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `CheckInFAB` | function | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@types/react/index").JSX.Element` |

## Imports

**Internal:**
- `../context/RouteContext` (`useRoute`)
- `../hooks/useArrivalEta` (`useArrivalEta`)
- `../store/checkIn` (`setCheckIn`)
- `../store/personalLocations` (`getContactNumber`, `subscribePersonalLocations`)
- `../utils/time` (`formatTime`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `expo-router` (`useRouter`)
- `react` (`useState`, `useEffect`)
- `react-native` (`Linking`, `StyleSheet`, `TouchableOpacity`)
- `react-native-paper` (`Text`)
