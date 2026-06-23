---
type: l1-file
spec_version: 1
source: src/api/backend.ts
content_sha: b4cbd4bcc0c1c2884a1f0e0a9d103312b009e82ac097c5286692cefc5cb51f0d
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.639Z
---

# backend.ts

**Path:** `src/api/backend.ts`
**Lines:** 88
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `getTransitRecords` | function | `(): Promise<TransitRecord[]>` |
| `createTransitRecord` | function | `(input: CreateTransitRecordInput): Promise<TransitRecord>` |
| `deleteTransitRecord` | function | `(id: string): Promise<void>` |
| `getTodayTrends` | function | `(route: string): Promise<DepartureSnapshot[]>` |
| `getRecentTrends` | function | `(route: string, days: number = 7): Promise<DepartureSnapshot[]>` |
| `getLatestDepartures` | function | `(route: string, limit: number = 1): Promise<DepartureSnapshot[]>` |
| `CreateTransitRecordInput` | interface |  |
| `TrendsResponse` | interface |  |

## Imports

**Internal:**
- `../types/storage` (`TransitRecord`, `DepartureSnapshot`)

**External:**
- `axios` (`default as axios`)

## Side effects

- **Reads env:** `EXPO_PUBLIC_API_URL`
