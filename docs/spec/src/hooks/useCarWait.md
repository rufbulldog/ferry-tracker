---
type: l1-file
spec_version: 1
source: src/hooks/useCarWait.ts
content_sha: 0fe3be7259552ee8d06a9e7263b616664b2977f430b35d908e5d6928c19ef08f
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.599Z
---

# useCarWait.ts

**Path:** `src/hooks/useCarWait.ts`
**Lines:** 76
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useCarWait` | function | `(route: Route): CarWaitResult` |
| `CarWaitResult` | interface |  |

### Documented exports

- **`useCarWait`** — Combine live capacity, WSF wait-time notes, WSF alerts, and recorded history

## Imports

**Internal:**
- `../utils/carWait` (`estimateCarWait`, `CarWaitEstimate`)
- `../utils/constants` (`ROUTES`, `Route`)
- `../utils/ferryDeparture` (`deriveSailingIntervalMinutes`, `effectiveFerryDeparture`)
- `../utils/typicalConditions` (`computeTypicalForSlot`)
- `./useDailyTrends` (`useRecentTrends`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useTerminalBulletins` (`useTerminalBulletins`)
- `./useTerminalWaitTimes` (`useTerminalWaitTimes`)

**External:**
- `react` (`useMemo`)
