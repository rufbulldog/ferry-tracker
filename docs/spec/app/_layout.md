---
type: l1-file
spec_version: 1
source: app/_layout.tsx
content_sha: 7bdd179888097553f7295c902e54d70dc172f05a4a742250722ffd3167bacf04
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:33.888Z
---

# _layout.tsx

**Path:** `app/_layout.tsx`
**Lines:** 61
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
- `react-native-paper` (`PaperProvider`)
- `react-native-safe-area-context` (`SafeAreaProvider`)
