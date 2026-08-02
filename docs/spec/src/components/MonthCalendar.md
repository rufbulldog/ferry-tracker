---
type: l1-file
spec_version: 1
source: src/components/MonthCalendar.tsx
content_sha: ff3361a759bb5fded1c629dc8b7a5797479bb43252e9e425f08a21fb77ef788c
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-02T05:28:25.658Z
---

# MonthCalendar.tsx

**Path:** `src/components/MonthCalendar.tsx`
**Lines:** 151
**Language:** TypeScript (TSX)

## Exports

| Name | Kind | Signature |
|---|---|---|
| `MonthCalendar` | function | `({ selected, min, max, onSelect }: MonthCalendarProps): any` |

### Documented exports

- **`MonthCalendar`** — Lightweight month-grid date picker (pure JS/RN — no native date-picker dep).

## Imports

**Internal:**
- `../context/ThemeContext` (`useTheme`)
- `../utils/dateHelpers` (`isSameDay`, `startOfDay`, `formatMonthLabel`)

**External:**
- `@expo/vector-icons` (`Ionicons`)
- `react` (`default as React`, `useState`)
- `react-native` (`View`, `StyleSheet`, `TouchableOpacity`)
- `react-native-paper` (`Text`)
