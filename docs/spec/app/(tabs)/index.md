---
type: l1-file
spec_version: 1
source: app/(tabs)/index.tsx
content_sha: ae4eb65a1be0cb5af76b7f1da59fc0407c4a52675cd7f9507c3bd01e0c71fd59
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-07-31T23:25:27.454Z
---

# index.tsx

**Path:** `app/(tabs)/index.tsx`
**Lines:** 381
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `default` | default | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@types/react/index").JSX.Element` |

## Imports

**Internal:**
- `../../src/components/AlertBanner` (`AlertBanner`)
- `../../src/components/FerryCard` (`FerryCard`)
- `../../src/components/LastDepartureCard` (`LastDepartureCard`)
- `../../src/components/MainDepartureCard` (`MainDepartureCard`)
- `../../src/context/RouteContext` (`useRoute`)
- `../../src/context/ThemeContext` (`useTheme`)
- `../../src/hooks/useLatestDeparture` (`useLatestDeparturePair`)
- `../../src/hooks/useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `../../src/hooks/useTerminalBulletins` (`useTerminalBulletins`)
- `../../src/utils/constants` (`ROUTES`, `TERMINALS`)

**External:**
- `@tanstack/react-query` (`useQueryClient`)
- `react` (`useState`, `useCallback`, `useMemo`, `useRef`, `useEffect`)
- `react-native` (`View`, `StyleSheet`, `ScrollView`, `RefreshControl`, `Animated`, `Dimensions`)
- `react-native-paper` (`Text`, `Card`, `ActivityIndicator`)
