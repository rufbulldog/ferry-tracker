---
type: l1-file
spec_version: 1
source: app/_layout.tsx
content_sha: 13e08d5ecdb069a6739e850bd392dcb500d58f64e84dac8e674d0c5a88b3a751
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:07:13.242Z
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
