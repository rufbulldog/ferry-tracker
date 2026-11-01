---
type: l1-file
spec_version: 1
source: app/_layout.tsx
content_sha: c72c28787818000a2001b95232feabe6de659d2b25145b0e5b4785b1300d403d
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-01T19:07:44.337Z
---

# _layout.tsx

**Path:** `app/_layout.tsx`
**Lines:** 83
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `default` | default | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@types/react/index").JSX.Element` |

## Imports

**Internal:**
- `../src/context/BestSailingContext` (`BestSailingProvider`)
- `../src/context/RouteContext` (`RouteProvider`, `useRoute`)
- `../src/context/ThemeContext` (`ThemeProvider`)
- `../src/hooks/useUserLocation` (`useUserLocation`)
- `../src/store/personalLocations` (`loadPersonalLocations`)
- `../src/utils/locations` (`findNearestLocation`, `getRouteDefaults`)

**External:**
- `@tanstack/react-query` (`QueryClient`, `QueryClientProvider`, `focusManager`)
- `expo-router` (`Stack`)
- `react` (`useEffect`, `useState`)
- `react-native` (`Alert`, `AppState`, `Platform`)
- `react-native-paper` (`PaperProvider`)
- `react-native-safe-area-context` (`SafeAreaProvider`)
