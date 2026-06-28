---
type: l1-file
spec_version: 1
source: src/store/personalLocations.ts
content_sha: aa5e53b22f469e16c7254a55272c5dc0fdc6db7f836e7d27beb9ea0f2089c0f8
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-28T18:29:47.365Z
---

# personalLocations.ts

**Path:** `src/store/personalLocations.ts`
**Lines:** 80
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `getPersonalCoords` | function | `(): PersonalCoords` |
| `getContactNumber` | function | `(): string \| undefined` |
| `getPersonalLocations` | function | `(): KnownLocation[]` |
| `loadPersonalLocations` | function | `(): Promise<boolean>` |
| `setPersonalCoords` | function | `(next: PersonalCoords): Promise<void>` |
| `subscribePersonalLocations` | function | `(fn: () => void): () => void` |
| `Coord` | interface |  |
| `PersonalCoords` | interface |  |

### Documented exports

- **`getPersonalCoords`** — Current home/work coords and contact number (synchronous read of the cache).
- **`getContactNumber`** — Current check-in contact number (synchronous read of the cache).
- **`getPersonalLocations`** — Home/work as KnownLocation[] for distance / routing logic.
- **`loadPersonalLocations`** — Load persisted coords into the in-memory cache. Call once at startup.
- **`setPersonalCoords`** — Persist new coords and update the cache.
- **`subscribePersonalLocations`** — Subscribe to coord changes; returns an unsubscribe function.

## Imports

**Internal:**
- `../utils/locations` (`KnownLocation`)

**External:**
- `@react-native-async-storage/async-storage` (`default as AsyncStorage`)
