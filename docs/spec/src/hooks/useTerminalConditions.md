---
type: l1-file
spec_version: 1
source: src/hooks/useTerminalConditions.ts
content_sha: b5cf70eeec1aa19ea77453b1203c7a4526f1fec8ce6fdc5a80c22b0705f26c03
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.698Z
---

# useTerminalConditions.ts

**Path:** `src/hooks/useTerminalConditions.ts`
**Lines:** 29
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useTerminalSailingSpace` | function | `(): import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/react-query/build/legacy/types").DefinedUseQueryResult<unknown, Error>` |
| `useSeattleTerminal` | function | `(): { error: Error; isError: true; isPending: false; isLoading: false; isLoadingError: false; isRefetchError: true; isSuccess: false; isPlaceholderData: false; status: "error"; dataUpdatedAt: number; errorUpdatedAt: number; failureCount: number; failureReason: Error; errorUpdateCount: number; isFetched: boolean; isFetchedAfterMount: boolean; isFetching: boolean; isInitialLoading: boolean; isPaused: boolean; isRefetching: boolean; isStale: boolean; isEnabled: boolean; refetch: (options?: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aq) => Promise<import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aH<TData, TError>>; fetchStatus: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").ay; promise: Promise<TData>; data: any; } \| { error: null; isError: false; isPending: false; isLoading: false; isLoadingError: false; isRefetchError: false; isSuccess: true; isPlaceholderData: false; status: "success"; dataUpdatedAt: number; errorUpdatedAt: number; failureCount: number; failureReason: Error; errorUpdateCount: number; isFetched: boolean; isFetchedAfterMount: boolean; isFetching: boolean; isInitialLoading: boolean; isPaused: boolean; isRefetching: boolean; isStale: boolean; isEnabled: boolean; refetch: (options?: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aq) => Promise<import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aH<TData, TError>>; fetchStatus: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").ay; promise: Promise<TData>; data: any; }` |
| `useBainbridgeTerminal` | function | `(): { error: Error; isError: true; isPending: false; isLoading: false; isLoadingError: false; isRefetchError: true; isSuccess: false; isPlaceholderData: false; status: "error"; dataUpdatedAt: number; errorUpdatedAt: number; failureCount: number; failureReason: Error; errorUpdateCount: number; isFetched: boolean; isFetchedAfterMount: boolean; isFetching: boolean; isInitialLoading: boolean; isPaused: boolean; isRefetching: boolean; isStale: boolean; isEnabled: boolean; refetch: (options?: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aq) => Promise<import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aH<TData, TError>>; fetchStatus: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").ay; promise: Promise<TData>; data: any; } \| { error: null; isError: false; isPending: false; isLoading: false; isLoadingError: false; isRefetchError: false; isSuccess: true; isPlaceholderData: false; status: "success"; dataUpdatedAt: number; errorUpdatedAt: number; failureCount: number; failureReason: Error; errorUpdateCount: number; isFetched: boolean; isFetchedAfterMount: boolean; isFetching: boolean; isInitialLoading: boolean; isPaused: boolean; isRefetching: boolean; isStale: boolean; isEnabled: boolean; refetch: (options?: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aq) => Promise<import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").aH<TData, TError>>; fetchStatus: import("/Users/brandontaylor/Coding/ferry-app/node_modules/@tanstack/query-core/build/legacy/hydration-BlEVG2Lp").ay; promise: Promise<TData>; data: any; }` |

## Imports

**Internal:**
- `../api/terminals` (`fetchTerminalSailingSpace`)
- `../utils/constants` (`TERMINALS`)

**External:**
- `@tanstack/react-query` (`useQuery`)
