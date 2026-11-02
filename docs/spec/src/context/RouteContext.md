---
type: l1-file
spec_version: 1
source: src/context/RouteContext.tsx
content_sha: eaf66efc2c3701e1239208c5c6a1b0c059036a63c838ea917e133a168b4d8f46
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:07:16.410Z
---

# RouteContext.tsx

**Path:** `src/context/RouteContext.tsx`
**Lines:** 126
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `RouteProvider` | function | `({ children }: { children: ReactNode }): any` |
| `useRoute` | function | `(): RouteContextValue` |
| `ROUTE_GROUP_LABELS` | const | `Record<RouteGroup, string>` |

## Imports

**Internal:**
- `../utils/constants` (`Route`)
- `../utils/routeGroups` (`ROUTE_GROUPS`, `RouteGroup`, `Direction`, `DEFAULT_ENABLED_ROUTE_GROUPS`, `normalizeEnabledGroups`, `routeFor`)

**External:**
- `@react-native-async-storage/async-storage` (`default as AsyncStorage`)
- `react` (`default as React`, `createContext`, `useContext`, `useState`, `useCallback`, `useEffect`, `useRef`, `ReactNode`)
