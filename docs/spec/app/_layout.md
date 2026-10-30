---
type: l1-file
spec_version: 1
source: app/_layout.tsx
content_sha: 0cd175a99a5fa3915357bd4470d1f2a43d08ff43c904dfb446826f10c8c66254
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-10-30T06:46:23.080Z
---

# _layout.tsx

**Path:** `app/_layout.tsx`
**Lines:** 80
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
- `@tanstack/react-query` (`QueryClient`, `QueryClientProvider`, `focusManager`)
- `expo-router` (`Stack`)
- `react` (`useEffect`, `useState`)
- `react-native` (`Alert`, `AppState`, `Platform`)
- `react-native-paper` (`PaperProvider`)
- `react-native-safe-area-context` (`SafeAreaProvider`)
