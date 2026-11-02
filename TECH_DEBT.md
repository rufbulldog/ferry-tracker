# Technical Debt & Future Improvements

Tracks remaining work for ferry-app. Completed items are removed — the history lives in commit messages.

## Next up

- **Drive around vs. take the ferry** (agreed 2026-11-01, after the 1.8.x Lock Screen check in the car).
  From somewhere off the commute (a tournament in Renton, Northgate), "Best from here" should also offer
  driving all the way home around the Sound and say which gets you home sooner. Needs a destination (saved
  home) and a real road ETA for both legs, so it's native: an Expo module over MapKit `MKDirections`
  (`expectedTravelTime`, ideally with traffic) to replace the straight-line drive heuristic in
  `src/utils/bestSailing.ts`, then a full `eas build`. Ferry option = drive to terminal + wait + crossing +
  drive from the far terminal home.

## Medium Priority

- **Validate the CarPlay screen in the simulator** — built but not yet seen (2026-11-01). Prebuild with
  `FERRY_CARPLAY=1 npx expo prebuild -p ios --clean`, `npx expo run:ios`, open the simulator's CarPlay
  display (I/O → External Displays → CarPlay) and check the "Best from here" list
  (`modules/ferry-live/ios/FerryCarPlay.swift`): best sailing + leave-by, "Missed it? Next", other route,
  and the waiting/no-sailing states. Also check the Live Activity's `.small` view on the CarPlay dashboard.
- **Request the CarPlay Driving Task entitlement** (developer.apple.com/carplay) — needed before any
  TestFlight build can include the CarPlay screen; then drop the `FERRY_CARPLAY` gate in
  `plugins/withCarPlay.js`.
- **Live Activity re-planning in the background** — the countdown ticks natively, but the target sailing
  only re-plans while the app is open. Needs background location (Always permission) or push updates.

## Low Priority

- **Companion apps (Watch + CarPlay)** — planning captured in [docs/companion-apps-plan.md](docs/companion-apps-plan.md). Centers on the core Ferry-tab data (departure, leave-by, ETA); shared backend `/plan` endpoint as the leave-by brain (built 2026-11-01, car-only; bike mode + recorded transit times still deferred). Endpoint spec: [docs/plan-endpoint-spec.md](docs/plan-endpoint-spec.md).
