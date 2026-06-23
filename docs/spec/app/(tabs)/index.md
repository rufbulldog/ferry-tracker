---
type: l1-file
spec_version: 1
source: app/(tabs)/index.tsx
content_sha: 9bc1a1972bc8d2cb06b95bac6bfe18692831c6d44c55a17bf8ebbc18cd74e2c8
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.621Z
---

# index.tsx

**Path:** `app/(tabs)/index.tsx`
**Lines:** 371
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
- `react` (`useState`, `useCallback`, `useRef`, `useEffect`)
- `react-native` (`View`, `StyleSheet`, `ScrollView`, `RefreshControl`, `Animated`, `Dimensions`)
- `react-native-paper` (`Text`, `Card`, `ActivityIndicator`)
