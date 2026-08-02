---
type: l1-file
spec_version: 1
source: infra/lambda/proxy/index.ts
content_sha: ddb2fe3c67aae0a64450585d7cc81c5f14a5dd17bfb463d37e97c56c152f4b01
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-02T05:28:25.650Z
---

# index.ts

**Path:** `infra/lambda/proxy/index.ts`
**Lines:** 94
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
