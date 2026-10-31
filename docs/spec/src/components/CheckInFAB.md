---
type: l1-file
spec_version: 1
source: src/components/CheckInFAB.tsx
content_sha: 493ba1c38ca570395da6295118d11f13f52d1bc8c1919cd0e4746f2019550a02
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-10-31T07:21:21.471Z
---

# CheckInFAB.tsx

**Path:** `src/components/CheckInFAB.tsx`
**Lines:** 138
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `CheckInFAB` | function | `({ inline = false }: CheckInFABProps): import("/home/user/ferry-tracker/node_modules/@types/react/index").JSX.Element` |

## Imports

**Internal:**
- `../context/RouteContext` (`useRoute`)
- `../hooks/useArrivalEta` (`useArrivalEta`)
- `../store/checkIn` (`setCheckIn`)
- `../store/personalLocations` (`getContactNumber`, `subscribePersonalLocations`)
- `../utils/time` (`formatTime`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `@tanstack/react-query` (`useQueryClient`)
- `expo-router` (`useRouter`)
- `react` (`useState`, `useEffect`)
- `react-native` (`AppState`, `Linking`, `StyleSheet`, `TouchableOpacity`)
- `react-native-paper` (`Text`)
