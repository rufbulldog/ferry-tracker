---
type: l1-file
spec_version: 1
source: app/(tabs)/settings.tsx
content_sha: 2624d3f5cdf96304bba9edde666c1a6fcadaaca309dcb2f0c4e6e2a2278968b8
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-09-14T02:10:09.275Z
---

# settings.tsx

**Path:** `app/(tabs)/settings.tsx`
**Lines:** 422
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `default` | default | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@types/react/index").JSX.Element` |

## Imports

**Internal:**
- `../../src/context/ThemeContext` (`useTheme`)
- `../../src/store/personalLocations` (`getPersonalCoords`, `setPersonalCoords`, `PersonalCoords`)
- `../../src/utils/themes` (`themes`, `ThemeName`, `Theme`, `themeNames`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `expo-application` (`* as Application`)
- `expo-constants` (`default as Constants`)
- `expo-location` (`* as Location`)
- `expo-updates` (`* as Updates`)
- `react` (`useState`)
- `react-native` (`View`, `StyleSheet`, `ScrollView`, `TouchableOpacity`, `Image`, `TextInput`, `Alert`, `Platform`)
- `react-native-paper` (`Text`)
- `react-native-safe-area-context` (`useSafeAreaInsets`)

## Side effects

- **Reads env:** `EXPO_PUBLIC_APP_ENV`
