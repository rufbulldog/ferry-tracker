---
type: l1-file
spec_version: 1
source: src/hooks/useTransitRecords.ts
content_sha: 20a53d800bf1c354b64b227dd16acf26dd43f78d45139030269e07b50b408a07
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.708Z
---

# useTransitRecords.ts

**Path:** `src/hooks/useTransitRecords.ts`
**Lines:** 131
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useTransitRecords` | function | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/react-query/build/legacy/types").DefinedUseQueryResult<unknown, Error>` |
| `useSaveTransitRecord` | function | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/react-query/build/legacy/types").UseMutationResult<unknown, Error, void, unknown>` |
| `useDeleteTransitRecord` | function | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/react-query/build/legacy/types").UseMutationResult<unknown, Error, void, unknown>` |
| `useAverageTransitTime` | function | `(route: TransitRoute, vehicle: Vehicle): any` |
| `useRecentTransitRecords` | function | `(limit: number = 10): { error: Error; isError: true; isPending: false; isLoading: false; isLoadingError: false; isRefetchError: true; isSuccess: false; isPlaceholderData: false; status: "error"; dataUpdatedAt: number; errorUpdatedAt: number; failureCount: number; failureReason: Error; errorUpdateCount: number; isFetched: boolean; isFetchedAfterMount: boolean; isFetching: boolean; isInitialLoading: boolean; isPaused: boolean; isRefetching: boolean; isStale: boolean; isEnabled: boolean; refetch: (options?: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aq) => Promise<import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aH<TData, TError>>; fetchStatus: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").ay; promise: Promise<TData>; data: any; } \| { error: null; isError: false; isPending: false; isLoading: false; isLoadingError: false; isRefetchError: false; isSuccess: true; isPlaceholderData: false; status: "success"; dataUpdatedAt: number; errorUpdatedAt: number; failureCount: number; failureReason: Error; errorUpdateCount: number; isFetched: boolean; isFetchedAfterMount: boolean; isFetching: boolean; isInitialLoading: boolean; isPaused: boolean; isRefetching: boolean; isStale: boolean; isEnabled: boolean; refetch: (options?: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aq) => Promise<import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aH<TData, TError>>; fetchStatus: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").ay; promise: Promise<TData>; data: any; }` |
| `useAllTransitAverages` | function | `(): { averages: {}; isLoading: false; }` |
| `TRANSIT_ROUTE_INFO` | const | `Record<TransitRoute, { label: string; shortLabel: string }>` |
| `TransitAverage` | interface |  |

## Imports

**Internal:**
- `../api/backend` (`getTransitRecords`, `createTransitRecord`, `deleteTransitRecord`)
- `../types/storage` (`TransitRecord`, `TransitRoute`, `Vehicle`)
- `../utils/transitStats` (`computeTypicalTransitSeconds`)

**External:**
- `@tanstack/react-query` (`useQuery`, `useMutation`, `useQueryClient`)
