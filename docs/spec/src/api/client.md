---
type: l1-file
spec_version: 1
source: src/api/client.ts
content_sha: c8050d98ed9a44df5b686567e13f723aa6afc22b016afedd906e4dfa13aebfef
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.639Z
---

# client.ts

**Path:** `src/api/client.ts`
**Lines:** 12
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `scheduleApi` | const | `axios.create({ baseURL: wsfBaseURL })` |
| `vesselsApi` | const | `axios.create({ baseURL: wsfBaseURL })` |
| `terminalsApi` | const | `axios.create({ baseURL: wsfBaseURL })` |

## Imports

**External:**
- `axios` (`default as axios`)

## Side effects

- **Reads env:** `EXPO_PUBLIC_API_URL`
