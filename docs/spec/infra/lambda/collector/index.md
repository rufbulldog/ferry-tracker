---
type: l1-file
spec_version: 1
source: infra/lambda/collector/index.ts
content_sha: b88de029293f056c5e72a9432f056b4fc695486ee73707d4b6806d039749e99e
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.630Z
---

# index.ts

**Path:** `infra/lambda/collector/index.ts`
**Lines:** 282
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `handler` | function | `(): unknown` |

## Imports

**External:**
- `@aws-sdk/client-dynamodb` (`DynamoDBClient`)
- `@aws-sdk/lib-dynamodb` (`DynamoDBDocumentClient`, `QueryCommand`, `PutCommand`)

## Side effects

- **Reads env:** `TABLE_NAME`, `WSF_API_KEY`
- **Network calls:** `fetch`
