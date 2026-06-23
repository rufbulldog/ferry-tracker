---
type: l1-file
spec_version: 1
source: src/context/ThemeContext.tsx
content_sha: 5b11727011b99f7ff4c2285df04baf3fd22e69585fdd909f05feb78813b5a641
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.655Z
---

# ThemeContext.tsx

**Path:** `src/context/ThemeContext.tsx`
**Lines:** 51
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `ThemeProvider` | function | `({ children }: { children: ReactNode }): any` |
| `useTheme` | function | `(): ThemeContextValue` |

## Imports

**Internal:**
- `../utils/themes` (`ThemeName`, `Theme`, `themes`, `DEFAULT_THEME`, `getTheme`)

**External:**
- `@react-native-async-storage/async-storage` (`default as AsyncStorage`)
- `react` (`default as React`, `createContext`, `useContext`, `useState`, `useEffect`, `ReactNode`)
