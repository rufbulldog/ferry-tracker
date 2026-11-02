---
type: l1-file
spec_version: 1
source: app/(tabs)/settings.tsx
content_sha: 57d36578cb6c8697a3625828450bf265bc3b23cea6bf6476c0f131e24af5f33a
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:07:16.383Z
---

# settings.tsx

**Path:** `app/(tabs)/settings.tsx`
**Lines:** 472
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `default` | default | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@types/react/index").JSX.Element` |

## Imports

**Internal:**
- `../../src/context/RouteContext` (`useRoute`)
- `../../src/context/ThemeContext` (`useTheme`)
- `../../src/store/personalLocations` (`getPersonalCoords`, `setPersonalCoords`, `PersonalCoords`)
- `../../src/utils/routeGroups` (`ALL_ROUTE_GROUPS`, `ROUTE_GROUPS`)
- `../../src/utils/themes` (`themes`, `ThemeName`, `Theme`, `themeNames`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `expo-application` (`* as Application`)
- `expo-constants` (`default as Constants`)
- `expo-location` (`* as Location`)
- `expo-updates` (`* as Updates`)
- `react` (`useState`)
- `react-native` (`View`, `StyleSheet`, `ScrollView`, `TouchableOpacity`, `Image`, `TextInput`, `Alert`, `Platform`, `Switch`)
- `react-native-paper` (`Text`)
- `react-native-safe-area-context` (`useSafeAreaInsets`)

## Side effects

- **Reads env:** `EXPO_PUBLIC_APP_ENV`
