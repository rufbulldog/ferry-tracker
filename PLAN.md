# Ferry App: Background Timer + GPS Location Defaulting

## Phase 1: Background Timer Persistence

**Problem**: `useTimer.ts` uses `setInterval` which pauses when the app is backgrounded or the phone locks.

**Solution**: Switch to timestamp-based timing with `AppState` awareness.

### Changes

**`src/hooks/useTimer.ts`** — Rewrite timer logic:
- Store a `startTimestamp` (via `useRef`) when timer starts
- On each tick, compute `elapsedSeconds = floor((Date.now() - startTimestamp) / 1000) + previousElapsed`
- Listen to React Native `AppState` changes:
  - On background → clear the interval (save battery), persist `startTimestamp` + `previousElapsed` to AsyncStorage
  - On foreground → recalculate elapsed from timestamp, restart interval
- On crash recovery: check AsyncStorage on mount for an in-progress timer and restore it
- No new dependencies needed — uses `AppState` from `react-native` and existing `@react-native-async-storage/async-storage`

**No other files change** — the hook's public API (`start`, `stop`, `resume`, `reset`, `elapsedSeconds`, `isRunning`, `isPaused`, `formattedTime`) stays identical so `timer.tsx` keeps working as-is.

---

## Phase 2: GPS-Based Location Defaulting

**Problem**: User must manually pick route group/direction in the top nav and timer route every time.

**Solution**: Use device GPS to detect proximity to known locations and auto-select defaults.

### Known Locations (coordinates)

| Location | Lat | Lon |
|----------|-----|-----|
| Home (Bainbridge) | 0.0 | 0.0 |
| Work (Seattle) | 0.0 | 0.0 |
| Bainbridge Ferry Terminal | 47.6235 | -122.5104 |
| Seattle Ferry Terminal (Colman Dock) | 47.6023 | -122.3384 |
| Kingston Ferry Terminal | 47.7964 | -122.4949 |
| Edmonds Ferry Terminal | 47.8106 | -122.3844 |

### GPS → Route Defaults (top nav: Depart, Recommend, Trends)

| Near... | routeGroup | direction | Reasoning |
|---------|-----------|-----------|-----------|
| Home / BI Terminal | bainbridge | outbound | Show departures FROM Bainbridge |
| Work / Seattle Terminal | bainbridge | inbound | Show departures FROM Seattle |
| Kingston Terminal | kingston | outbound | Show departures FROM Kingston |
| Edmonds Terminal | kingston | inbound | Show departures FROM Edmonds |

### GPS → Timer Route Defaults

| Near... | Timer Route | Reasoning |
|---------|-------------|-----------|
| Home | bi-home-to-ferry | Starting commute to ferry |
| Bainbridge Terminal | bi-ferry-to-home | Just got off ferry, heading home |
| Seattle Terminal | bi-ferry-to-work | Just got off ferry, heading to work |
| Work | bi-work-to-ferry | Heading back to ferry |
| Kingston Terminal | (no change) | No return-leg route defined yet |
| Edmonds Terminal | (no change) | No return-leg route defined yet |

### New Files

1. **`src/utils/locations.ts`** — Define known locations with coords, GPS distance utility (haversine), and nearest-location resolver
2. **`src/hooks/useUserLocation.ts`** — Hook wrapping `expo-location`: requests permission, gets current position, returns `{ location, error, loading }`

### Modified Files

3. **`src/utils/constants.ts`** — No changes needed (location data goes in new file)
4. **`src/context/RouteContext.tsx`** — Add optional `setDefaults(routeGroup, direction)` that the location hook can call on mount. Only sets defaults if user hasn't manually changed the selection yet (track with a `userHasSelected` ref).
5. **`app/(tabs)/timer.tsx`** — Use `useUserLocation` to auto-select the timer route on mount (before the user starts the timer). Respect manual overrides.
6. **`app/_layout.tsx`** — Import `useUserLocation` and call `setDefaults` on RouteContext based on GPS proximity. This sets the initial top-nav defaults for all tabs.
7. **`app.json`** — Add `expo-location` plugin + `NSLocationWhenInUseUsageDescription` permission string

### Dependency

- Install `expo-location`

---

## Phase 3: Live Activities Lock Screen Widget (future follow-up)

**Not implemented now.** Outline for later:

- Create a native Swift Widget Extension target using ActivityKit/WidgetKit
- Define `TimerActivityAttributes` (route name, vehicle) and `ContentState` (elapsed seconds, start time, is running)
- Build an Expo config plugin to inject the widget extension target during `prebuild`
- Create a native module bridge (`TimerLiveActivity`) with methods: `startActivity`, `updateActivity`, `endActivity`
- Call from `useTimer.ts` when timer starts/stops/pauses
- Requires a new native build (`eas build` or `expo run:ios`) after implementation
