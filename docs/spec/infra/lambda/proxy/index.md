---
type: l1-file
spec_version: 1
source: infra/lambda/proxy/index.ts
content_sha: 08a217f8224775846e00c869edcd1703c9436926a8d744033f6eb9c32af33fbe
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.637Z
---

# index.ts

**Path:** `infra/lambda/proxy/index.ts`
**Lines:** 78
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `wsfPathFor` | function | `(resource: string, params: Record<string, string \| undefined> \| null): string \| null` |
| `handler` | function | `(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>` |

### Documented exports

- **`wsfPathFor`** — Map an API Gateway resource template (+ path params) to the upstream WSF REST

## Imports

**External:**
- `aws-lambda` (`APIGatewayProxyEvent`, `APIGatewayProxyResult`)

## Side effects

- **Reads env:** `WSF_API_KEY`
- **Network calls:** `fetch`
