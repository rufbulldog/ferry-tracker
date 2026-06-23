---
type: l1-file
spec_version: 1
source: src/store/personalLocations.ts
content_sha: 4812d11b2b45de28578017cc97436174f1047dd0c6745cfc942b5d4b4000f2c6
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.719Z
---

# personalLocations.ts

**Path:** `src/store/personalLocations.ts`
**Lines:** 68
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `getPersonalCoords` | function | `(): PersonalCoords` |
| `getPersonalLocations` | function | `(): KnownLocation[]` |
| `loadPersonalLocations` | function | `(): Promise<void>` |
| `setPersonalCoords` | function | `(next: PersonalCoords): Promise<void>` |
| `subscribePersonalLocations` | function | `(fn: () => void): () => void` |
| `Coord` | interface |  |
| `PersonalCoords` | interface |  |

### Documented exports

- **`getPersonalCoords`** — Current home/work coords (synchronous read of the cache).
- **`getPersonalLocations`** — Home/work as KnownLocation[] for distance / routing logic.
- **`loadPersonalLocations`** — Load persisted coords into the in-memory cache. Call once at startup.
- **`setPersonalCoords`** — Persist new coords and update the cache.
- **`subscribePersonalLocations`** — Subscribe to coord changes; returns an unsubscribe function.

## Imports

**Internal:**
- `../utils/locations` (`KnownLocation`)

**External:**
- `@react-native-async-storage/async-storage` (`default as AsyncStorage`)
