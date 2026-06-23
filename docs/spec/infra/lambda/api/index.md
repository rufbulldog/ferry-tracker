---
type: l1-file
spec_version: 1
source: infra/lambda/api/index.ts
content_sha: 309dadc0321003148284524c0d9d3298467bedd4a8f7e7be6395635487c0e594
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.629Z
---

# index.ts

**Path:** `infra/lambda/api/index.ts`
**Lines:** 211
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `handler` | function | `(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>` |

## Imports

**External:**
- `@aws-sdk/client-dynamodb` (`DynamoDBClient`)
- `@aws-sdk/lib-dynamodb` (`DynamoDBDocumentClient`, `QueryCommand`, `PutCommand`, `DeleteCommand`, `ScanCommand`)
- `aws-lambda` (`APIGatewayProxyEvent`, `APIGatewayProxyResult`)

## Side effects

- **Reads env:** `DEPARTURES_TABLE`, `TRANSIT_TABLE`
