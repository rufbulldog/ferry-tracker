# Companion Apps Plan — Apple Watch & CarPlay

Design doc for a Watch + CarPlay companion experience for Ferry Tracker, centered on
the core **Time / Leave** data: *when's the next ferry at the nearest terminal, a couple
more upcoming, when to leave, and will I make it.*

Status: **planning only** — no build order committed yet. Decisions locked so far:
- Scope: capture the architecture; pick a build order later.
- Leave-by "brain": **backend `/plan` endpoint** (shared by both surfaces).

---

## 1. The constraint that shapes everything

**React Native / Expo cannot build a watchOS app.** There is no RN runtime on the watch —
a Watch app must be native SwiftUI/Swift. CarPlay is different: `react-native-carplay`
runs inside the existing JS context, so it *can* reuse the TypeScript hooks directly.

Second constraint: `ios/` and `android/` are **gitignored** (`.gitignore:42-43`) — this is
managed Expo with on-demand prebuild. Neither target can be hand-added in Xcode; prebuild
would wipe it. Both must be introduced via **config plugins**:

- **Watch target** → [`@bacons/apple-targets`](https://github.com/EvanBacon/apple-targets)
  (adds watchOS / widget / App Clip targets that survive prebuild).
- **CarPlay** → `react-native-carplay`'s config plugin (scene delegate + entitlement wiring).

### Surface comparison

| | Apple Watch | CarPlay |
|---|---|---|
| Language | Native SwiftUI (no JS/TS reuse) | Existing TS/React hooks (full reuse) |
| Leave-by brain | Backend `/plan` (chosen) | Backend `/plan` or reuse hooks directly |
| Apple gating | None | **CarPlay entitlement required** — restricted; needs Apple approval. Fits the iOS 16+ *"driving task app"* category (glanceable, read-only) |
| Network | Its own (CoreLocation + URLSession) — works standalone | Phone's |
| Relative effort | Higher (new native app + data path) | Lower logic; blocked on entitlement approval |

Because the watch is native and can't reuse the TS leave-by logic, putting the brain
server-side is what keeps the two surfaces from forking that logic three ways.

---

## 2. Architecture — backend `/plan` endpoint as the shared brain

Today the leave-by logic lives in TypeScript and is non-trivial:
`useRecommendation` → `computePlanEstimate` → `transitStats` / `carWait` /
`typicalConditions` / `ferryDeparture`. Reimplementing that in Swift for the watch would
fork it. Instead, move the computation server-side (CDK Lambda) and have both surfaces
consume a thin, pre-computed result.

### Proposed endpoint

```
GET /plan?routeGroup=<bainbridge|kingston>&direction=<outbound|inbound>&vehicle=<car|bike>&lat=<n>&lon=<n>
```

Response (next ~3 sailings):

```jsonc
{
  "terminal": { "id": "bi-terminal", "label": "Bainbridge Ferry Terminal" },
  "route": "bainbridge-seattle",
  "sailings": [
    {
      "scheduled": "2026-08-17T15:20:00-07:00",
      "status": "scheduled",        // scheduled | loading | departed | arriving | returning | cancelled
      "delayMin": 0,
      "capacityPct": 62,            // null when unknown
      "leaveBy": "2026-08-17T14:58:00-07:00",
      "makeable": true              // leaveBy > now
    }
    // + 2 more
  ]
}
```

### Where the data already is

- **Schedule + live vessel + trends + capacity** — backend already has these (the app's
  `useNextDepartures` composes WSF sailing-space + vessel data; trends/latest come from the
  backend). The Lambda replicates that composition server-side.
- **Transit records** — already server-side (`getTransitRecords`, `GET /transit-records`),
  so recorded door-to-dock times are available to the Lambda.
- **Personal home/work locations** — **on-device only** (`src/store/personalLocations.ts`,
  AsyncStorage). Not available server-side.

### v1 simplification for personal locations

Nearest-terminal detection uses the **public terminal coordinates** already in
`src/utils/locations.ts:7` (`PUBLIC_TERMINALS`) via the existing `findNearestLocation` /
`haversineDistance` — no personal data needed. The watch/CarPlay client sends its GPS; the
endpoint (or the client, using the same haversine) picks the nearest terminal → route group
+ direction via `getRouteDefaults`.

Personalized door-to-dock transit times (which currently blend on-device records) are
**deferred**: v1 leave-by uses the static `TRAVEL_TIMES` defaults plus server-side transit
records. Later options: pass a per-user transit override as a param, or sync personal
locations to the backend.

### "Will I make it" — the core payload

For each of the next 3 sailings:

```
makeable = leaveBy > now
```

Render as **"Leave by 8:42"** plus a three-state indicator:
- **Go now** — within ~2 min of `leaveBy`
- **Make it** (green) — `leaveBy` comfortably in the future
- **Missed** (red/greyed) — `leaveBy` in the past

That, times three sailings, is the entire glanceable surface. Mirrors the phone's Leave
card but stripped to the essentials.

---

## 3. Apple Watch (native SwiftUI)

- **Target** via `@bacons/apple-targets` config plugin so it survives `expo prebuild`.
- **Location**: CoreLocation on the watch (all modern models have GPS; cellular models work
  phone-free). Request when-in-use; reuse the same usage-string rationale as the phone
  (`app.json` `NSLocationWhenInUseUsageDescription`).
- **Data path**: standalone — watch calls `/plan` directly over URLSession. No dependency on
  the phone app running or being in range. (WatchConnectivity is a fallback, not the primary
  path — avoided so the watch stays useful on its own.)
- **UI**:
  - Main view: nearest terminal + list of 3 sailings, each with departure time, "leave by",
    and make-it state.
  - **Complication** ("next ferry / leave by HH:MM") — the highest-value piece for a
    glance-from-the-wrist commute tool.
- **Refresh**: on-wrist-raise / app foreground pull; background refresh budget for the
  complication.

Effort: highest of the three. New native app + first server round-trip through `/plan`.

---

## 4. CarPlay (`react-native-carplay`)

- **Runs in the existing JS context** — can call `useNextDepartures` / `useRecommendation`
  directly, *or* the same `/plan` endpoint. Reusing the hooks means near-zero new business
  logic.
- **UI**: `CPListTemplate` of the next 3 sailings (CarPlay is template-based, read-only —
  a perfect fit for glanceable departures; no free-form UI, which is exactly what a driving
  context should be).
- **Location**: `expo-location` → nearest route via existing utils.
- **The long pole — entitlement**: CarPlay is a **restricted entitlement**; Apple must
  approve it. Ferry departures fit the iOS 16+ **"driving task app"** category (glanceable,
  minimal interaction). This approval is asynchronous and can take time, so if CarPlay is in
  scope, **file the request first** and let it run in the background while other work
  proceeds.

Effort: least new logic, but gated on Apple approval.

---

## 5. Suggested phasing (when a build order is chosen)

1. **Backend `/plan` endpoint (CDK)** — refactor the leave-by math into a shared, unit-tested
   module the Lambda calls; expose the endpoint. Unblocks both surfaces. Independent of any
   Apple gating, so it's the natural first step regardless of which surface ships first.
2. **CarPlay** — `CPListTemplate` over the nearest route; wire `expo-location`. *In parallel,
   before anything else if CarPlay is wanted:* file the CarPlay entitlement request with Apple.
3. **Watch** — `@bacons/apple-targets` SwiftUI target: CoreLocation → `/plan` → list view +
   complication.

The `/plan` refactor (step 1) also has a side benefit for the phone: `useRecommendation` and
`computePlanEstimate` could eventually thin out to consume the same endpoint, removing
duplicated logic — but that's optional and not required for the companions.

---

## 6. Open questions / risks

- **CarPlay entitlement approval** — timeline and category acceptance are outside our control;
  the biggest schedule risk if CarPlay is in scope.
- **Personalized transit times on companions** — deferred for v1 (static defaults + server
  transit records). Revisit whether to sync personal locations server-side or pass overrides.
- **`/plan` vs. duplicating WSF composition** — the Lambda must replicate the vessel/sailing
  composition currently in `useNextDepartures`. Decide whether to share that as a common
  module or accept a second implementation server-side.
- **Native-change ship path** — adding either target flips ships from OTA to full `eas build`
  (native config change per `CLAUDE.md`), and bumps `runtimeVersion`. Not an OTA feature.
- **Auth/rate-limiting on `/plan`** — the endpoint is public-ish (WSF data is public), but
  the watch calling it directly warrants basic throttling.

---

## 7. Key file references (existing logic to draw from)

- `src/hooks/useRecommendation.ts` — live leave-by brain to port server-side.
- `src/utils/planEstimate.ts` — pure leave-by for future sailings; closest to what `/plan` needs.
- `src/hooks/useNextDepartures.ts` — vessel/sailing composition to replicate in the Lambda.
- `src/utils/locations.ts` — `PUBLIC_TERMINALS`, `haversineDistance`, `findNearestLocation`, `getRouteDefaults`.
- `src/hooks/useUserLocation.ts` — GPS pattern (CoreLocation equivalent on watch).
- `src/api/backend.ts` — existing endpoint client patterns; where a `getPlan()` would live.
