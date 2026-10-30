---
type: l1-file
spec_version: 1
source: src/components/CheckInFAB.tsx
content_sha: 3cf9dc19788c04a4a38c309e94ec5ef65565e8ab203e0e030cca888584bd95b1
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-10-30T06:46:27.690Z
---

# CheckInFAB.tsx

**Path:** `src/components/CheckInFAB.tsx`
**Lines:** 123
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
- `@tanstack/react-query` (`useQueryClient`)
- `expo-router` (`useRouter`)
- `react` (`useState`, `useEffect`)
- `react-native` (`AppState`, `Linking`, `StyleSheet`, `TouchableOpacity`)
- `react-native-paper` (`Text`)
