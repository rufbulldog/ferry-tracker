---
type: l1-file
spec_version: 1
source: src/utils/ferryDeparture.ts
content_sha: 43a3224281726209fa5f029f6e50aee8c1f0f05a0975f446d00e4017cfc3e598
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.651Z
---

# ferryDeparture.ts

**Path:** `src/utils/ferryDeparture.ts`
**Lines:** 80
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `effectiveFerryDeparture` | function | `(d: FerryDepartureLike): EffectiveFerryDeparture` |
| `deriveSailingIntervalMinutes` | function | `(scheduledDepartures: Date[], fallback: number): number` |
| `FerryDepartureLike` | interface |  |
| `DepartureBasis` | type |  |
| `EffectiveFerryDeparture` | interface |  |

### Documented exports

- **`effectiveFerryDeparture`** — Resolve the effective departure for a sailing. Preference order:
- **`deriveSailingIntervalMinutes`** — Median gap (in minutes) between consecutive scheduled departures — the
- **`FerryDepartureLike`** — Single source of truth for a sailing's *effective* departure time and how
