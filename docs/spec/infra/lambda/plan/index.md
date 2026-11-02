---
type: l1-file
spec_version: 1
source: infra/lambda/plan/index.ts
content_sha: 49e8caccc3238b97ca4208b7e5a4333d92f9c8e30e831799ea206748a6647d28
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T02:40:10.648Z
---

# index.ts

**Path:** `infra/lambda/plan/index.ts`
**Lines:** 189
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `handler` | function | `(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>` |

## Imports

**Internal:**
- `./plan` (`buildPlan`, `departingTerminals`, `parsePlanQuery`, `PLAN_ROUTES`, `PlanInputs`, `hasSailingSpace`, `ScheduledSailing`)

**External:**
- `@aws-sdk/client-dynamodb` (`DynamoDBClient`)
- `@aws-sdk/lib-dynamodb` (`DynamoDBDocumentClient`, `QueryCommand`)
- `aws-lambda` (`APIGatewayProxyEvent`, `APIGatewayProxyResult`)

## Side effects

- **Reads env:** `DEPARTURES_TABLE`, `TZ`, `WSF_API_KEY`
- **Network calls:** `fetch`
