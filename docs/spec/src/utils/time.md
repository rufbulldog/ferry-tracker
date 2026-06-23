---
type: l1-file
spec_version: 1
source: src/utils/time.ts
content_sha: a117e1a270999359127885c958ae1dce0f0c1407a1a8f55f152008c0155288fd
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.721Z
---

# time.ts

**Path:** `src/utils/time.ts`
**Lines:** 56
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `parseDate` | function | `(date: Date \| string \| null \| undefined): Date \| null` |
| `calculateDelayMinutes` | function | `(scheduledDeparture: string \| null, actualDeparture: string \| null): number` |
| `formatTime` | function | `(date: Date \| string \| null \| undefined): string` |
| `getMinutesUntil` | function | `(date: Date \| string): number` |
| `addMinutes` | function | `(date: Date, minutes: number): Date` |
