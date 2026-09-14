---
type: l1-file
spec_version: 1
source: src/utils/predictedDelay.ts
content_sha: d3af8786ec2e3638021902a8e21fe7926711d43815f427c29b4e376bef3df602
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-09-14T02:10:09.346Z
---

# predictedDelay.ts

**Path:** `src/utils/predictedDelay.ts`
**Lines:** 98
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `predictInboundDelay` | function | `(input: InboundPredictionInput): InboundPrediction` |
| `EVENING_RECOVERY_HOUR` | const | `18` |
| `RECOVERY_CAPACITY_PERCENT` | const | `60` |
| `PredictedDelayBasis` | type |  |
| `InboundPrediction` | interface |  |
| `InboundPredictionInput` | interface |  |

## Imports

**Internal:**
- `./time` (`addMinutes`)
