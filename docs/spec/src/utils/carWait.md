---
type: l1-file
spec_version: 1
source: src/utils/carWait.ts
content_sha: f1ef66ad3a970ac86b7b861a16242ee824844cc723597175aac296e604aaa4e3
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.650Z
---

# carWait.ts

**Path:** `src/utils/carWait.ts`
**Lines:** 220
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `parseVehicleWaitNote` | function | `(text: string \| null \| undefined): ParsedWait \| null` |
| `parseWaitFromAlert` | function | `(text: string \| null \| undefined): ParsedWait \| null` |
| `estimateCarWait` | function | `(inp: CarWaitInputs): CarWaitEstimate` |
| `CarWaitReason` | type |  |
| `CarWaitConfidence` | type |  |
| `CarWaitEstimate` | interface |  |
| `CarWaitInputs` | interface |  |

### Documented exports

- **`parseVehicleWaitNote`** — Parse a WSF terminalwaittimes note (vehicle wait).
- **`parseWaitFromAlert`** — Parse a WSF alert/bulletin, but only when it actually concerns vehicle waits —
- **`estimateCarWait`** — Combine all available signals into a single car-wait estimate. Pure and
- **`CarWaitReason`** — Estimate the *extra* wait a driver faces beyond the ferry's own departure,
