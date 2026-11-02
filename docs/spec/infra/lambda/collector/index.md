---
type: l1-file
spec_version: 1
source: infra/lambda/collector/index.ts
content_sha: 3eb88de2fa4e2663cccbfcefcbd62a9252347c50c217cdabd79e0a7a9fc6eec1
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:07:16.391Z
---

# index.ts

**Path:** `infra/lambda/collector/index.ts`
**Lines:** 405
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
