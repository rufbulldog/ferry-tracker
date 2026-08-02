---
type: l1-file
spec_version: 1
source: app/_layout.tsx
content_sha: 5aa5b09f00a420077e94ef90e6022ec265d19ddae443495dcfc8949e081e7e02
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-02T05:28:21.869Z
---

# _layout.tsx

**Path:** `app/_layout.tsx`
**Lines:** 70
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
