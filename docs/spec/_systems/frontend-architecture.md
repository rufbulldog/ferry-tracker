---
type: l3-system
spec_version: 1
name: frontend-architecture
discovered_from: code-graph + repo config
resource_count: 20
extractor_version: 1.0.2
renderer_version: 1.0.2
last_audited: 2026-11-01T19:07:47.901Z
---

# Frontend architecture — System Spec

Cross-cutting view of how the app is wired: which contexts exist, which files consume them, and which custom hooks see widespread use.

## Architecture

```mermaid
flowchart TD
  App["App (screens + components)"]
  App --> ctx_BestSailingContext["BestSailingContext — 2 consumers"]
  App --> ctx_RouteContext["RouteContext — 7 consumers"]
  App --> ctx_ThemeContext["ThemeContext — 15 consumers"]
  App -.-> hook_useArrivalEta["useArrivalEta — 2 consumers"]
  App -.-> hook_useBestSailing["useBestSailing — 1 consumer"]
  App -.-> hook_useCarWait["useCarWait — 3 consumers"]
  App -.-> hook_useDailyTrends["useDailyTrends — 5 consumers"]
  App -.-> hook_useFutureSchedule["useFutureSchedule — 1 consumer"]
  App -.-> hook_useLatestDeparture["useLatestDeparture — 1 consumer"]
  App -.-> hook_useLiveActivity["useLiveActivity — 1 consumer"]
  App -.-> hook_useNextDepartures["useNextDepartures — 11 consumers"]
  App -.-> hook_useRecommendation["useRecommendation — 1 consumer"]
  App -.-> hook_useTerminalBulletins["useTerminalBulletins — 4 consumers"]
  App -.-> hook_useTerminalConditions["useTerminalConditions — 1 consumer"]
  App -.-> hook_useTerminalWaitTimes["useTerminalWaitTimes — 1 consumer"]
  App -.-> hook_useTimer["useTimer — 1 consumer"]
  App -.-> hook_useTransitRecords["useTransitRecords — 4 consumers"]
  App -.-> hook_useUserLocation["useUserLocation — 2 consumers"]
  App -.-> hook_useVesselLocations["useVesselLocations — 1 consumer"]
  App -.-> hook_useWatchedLocation["useWatchedLocation — 1 consumer"]
```

## Contexts (3)

| Context | Exports | Consumers |
|---|---|---|
| [`BestSailingContext.tsx`](../src/context/BestSailingContext.md) | `BestSailingProvider`, `useBestSailingContext`, `BestSailingContextValue` | 2 files |
| [`RouteContext.tsx`](../src/context/RouteContext.md) | `RouteProvider`, `useRoute`, `ROUTE_GROUP_LABELS` | 7 files |
| [`ThemeContext.tsx`](../src/context/ThemeContext.md) | `ThemeProvider`, `useTheme` | 15 files |

## Custom hooks (17)

| Hook | Consumers |
|---|---|
| [`useArrivalEta.ts`](../src/hooks/useArrivalEta.md) | 2 files |
| [`useBestSailing.ts`](../src/hooks/useBestSailing.md) | 1 files |
| [`useCarWait.ts`](../src/hooks/useCarWait.md) | 3 files |
| [`useDailyTrends.ts`](../src/hooks/useDailyTrends.md) | 5 files |
| [`useFutureSchedule.ts`](../src/hooks/useFutureSchedule.md) | 1 files |
| [`useLatestDeparture.ts`](../src/hooks/useLatestDeparture.md) | 1 files |
| [`useLiveActivity.ts`](../src/hooks/useLiveActivity.md) | 1 files |
| [`useNextDepartures.ts`](../src/hooks/useNextDepartures.md) | 11 files |
| [`useRecommendation.ts`](../src/hooks/useRecommendation.md) | 1 files |
| [`useTerminalBulletins.ts`](../src/hooks/useTerminalBulletins.md) | 4 files |
| [`useTerminalConditions.ts`](../src/hooks/useTerminalConditions.md) | 1 files |
| [`useTerminalWaitTimes.ts`](../src/hooks/useTerminalWaitTimes.md) | 1 files |
| [`useTimer.ts`](../src/hooks/useTimer.md) | 1 files |
| [`useTransitRecords.ts`](../src/hooks/useTransitRecords.md) | 4 files |
| [`useUserLocation.ts`](../src/hooks/useUserLocation.md) | 2 files |
| [`useVesselLocations.ts`](../src/hooks/useVesselLocations.md) | 1 files |
| [`useWatchedLocation.ts`](../src/hooks/useWatchedLocation.md) | 1 files |

## Cross-refs

- [`src/context/_module.md`](../src/context/_module.md)
- [`src/hooks/_module.md`](../src/hooks/_module.md)
