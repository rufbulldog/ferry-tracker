---
type: l1-file
spec_version: 1
source: app/_layout.tsx
content_sha: 03ae9a4540346af16771c88999b9289687bb81ab008cdde08953df7cced0bb85
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-28T18:29:43.854Z
---

# _layout.tsx

**Path:** `app/_layout.tsx`
**Lines:** 69
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `default` | default | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@types/react/index").JSX.Element` |

## Imports

**Internal:**
- `../src/context/RouteContext` (`RouteProvider`, `useRoute`)
- `../src/context/ThemeContext` (`ThemeProvider`)
- `../src/hooks/useUserLocation` (`useUserLocation`)
- `../src/store/personalLocations` (`loadPersonalLocations`)
- `../src/utils/locations` (`findNearestLocation`, `getRouteDefaults`)

**External:**
- `@tanstack/react-query` (`QueryClient`, `QueryClientProvider`)
- `expo-router` (`Stack`)
- `react` (`useEffect`, `useState`)
- `react-native` (`Alert`)
- `react-native-paper` (`PaperProvider`)
- `react-native-safe-area-context` (`SafeAreaProvider`)
