---
type: l1-file
spec_version: 1
source: infra/lambda/proxy/index.ts
content_sha: 93d0f1d0f7f10df750fe3cac9c42d637da21420cf2da5ed2b7dd28d2bd2b258f
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.575Z
---

# index.ts

**Path:** `infra/lambda/proxy/index.ts`
**Lines:** 84
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
