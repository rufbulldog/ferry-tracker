---
type: l1-file
spec_version: 1
source: src/hooks/useRouteVessels.ts
content_sha: e0a02fccff3428337fda65445c301cb1cc7f0d074b5967101775f4f0a30b42e6
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.673Z
---

# useRouteVessels.ts

**Path:** `src/hooks/useRouteVessels.ts`
**Lines:** 21
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useRouteVessels` | function | `(): { error: Error; isError: true; isPending: false; isLoading: false; isLoadingError: false; isRefetchError: true; isSuccess: false; isPlaceholderData: false; status: "error"; dataUpdatedAt: number; errorUpdatedAt: number; failureCount: number; failureReason: Error; errorUpdateCount: number; isFetched: boolean; isFetchedAfterMount: boolean; isFetching: boolean; isInitialLoading: boolean; isPaused: boolean; isRefetching: boolean; isStale: boolean; isEnabled: boolean; refetch: (options?: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aq) => Promise<import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aH<TData, TError>>; fetchStatus: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").ay; promise: Promise<TData>; data: any; } \| { error: null; isError: false; isPending: false; isLoading: false; isLoadingError: false; isRefetchError: false; isSuccess: true; isPlaceholderData: false; status: "success"; dataUpdatedAt: number; errorUpdatedAt: number; failureCount: number; failureReason: Error; errorUpdateCount: number; isFetched: boolean; isFetchedAfterMount: boolean; isFetching: boolean; isInitialLoading: boolean; isPaused: boolean; isRefetching: boolean; isStale: boolean; isEnabled: boolean; refetch: (options?: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aq) => Promise<import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aH<TData, TError>>; fetchStatus: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").ay; promise: Promise<TData>; data: any; }` |

## Imports

**Internal:**
- `../utils/constants` (`TERMINALS`)
- `./useVesselLocations` (`useVesselLocations`)

**External:**
- `react` (`useMemo`)
