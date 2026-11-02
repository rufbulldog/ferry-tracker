---
type: l1-file
spec_version: 1
source: src/hooks/useDriveTimes.ts
content_sha: 9198935392cd77bccf91ffcde82af6ccca7e57e0340bf4eedafb6e240f8e422d
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:53:15.248Z
---

# useDriveTimes.ts

**Path:** `src/hooks/useDriveTimes.ts`
**Lines:** 79
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useDriveTimes` | function | `(origin: { lat: number; lon: number } \| null, destinations: DrivePoint[]): DriveMinutes` |
| `useDriveTimesTo` | function | `(origins: DrivePoint[], destination: { lat: number; lon: number } \| null): DriveMinutes` |
| `DrivePoint` | interface |  |
| `DriveMinutes` | type |  |

### Documented exports

- **`useDriveTimes`** — Apple Maps road drive times (with traffic) from `origin` to each point.
- **`useDriveTimesTo`** — Drive times from several fixed origins (far-side terminals) to one point
- **`DriveMinutes`** — Minutes by destination id; missing/null = unknown (use the estimate).

## Imports

**Internal:**
- `../../modules/ferry-live` (`FerryLive`)

**External:**
- `@tanstack/react-query` (`useQuery`)
