---
type: l1-file
spec_version: 1
source: infra/lambda/collector/index.ts
content_sha: dc839b123162677bd1c5ceb136a94ab3e8975d6abf7cb99fbc9760e170d17a05
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-09-14T02:10:09.281Z
---

# index.ts

**Path:** `infra/lambda/collector/index.ts`
**Lines:** 400
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `computeCrossingMinutes` | function | `(departure: Date, arrival: Date): number` |
| `handler` | function | `(): unknown` |

## Imports

**External:**
- `@aws-sdk/client-dynamodb` (`DynamoDBClient`)
- `@aws-sdk/lib-dynamodb` (`DynamoDBDocumentClient`, `QueryCommand`, `PutCommand`, `UpdateCommand`, `DeleteCommand`)

## Side effects

- **Reads env:** `TABLE_NAME`, `WSF_API_KEY`
- **Network calls:** `fetch`
