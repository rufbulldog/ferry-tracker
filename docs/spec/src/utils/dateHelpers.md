---
type: l1-file
spec_version: 1
source: src/utils/dateHelpers.ts
content_sha: 766eaf5e5d027c1648f9e1b1c98ad07071eaadb8e9dd7b3017b833b34cafa9ed
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-02T05:28:25.720Z
---

# dateHelpers.ts

**Path:** `src/utils/dateHelpers.ts`
**Lines:** 43
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `toYMD` | function | `(date: Date): string` |
| `addDays` | function | `(date: Date, n: number): Date` |
| `startOfDay` | function | `(date: Date): Date` |
| `isSameDay` | function | `(a: Date, b: Date): boolean` |
| `formatDayLabel` | function | `(date: Date): string` |
| `formatMonthLabel` | function | `(date: Date): string` |
| `daysBetween` | function | `(a: Date, b: Date): number` |

### Documented exports

- **`toYMD`** — Local YYYY-MM-DD (the format WSF's schedule endpoint expects as TripDate).
- **`formatDayLabel`** — "Mon, Aug 10" style label.
- **`formatMonthLabel`** — "August 2026" style label.
- **`daysBetween`** — Days (date-only) between two dates; positive if b is after a.
