# Technical Debt & Future Improvements

Tracks remaining work for ferry-app. Completed items are removed — the history lives in commit messages.

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

- **Companion apps (Watch + CarPlay)** — planning captured in [docs/companion-apps-plan.md](docs/companion-apps-plan.md). Centers on the core Ferry-tab data (departure, leave-by, ETA); shared backend `/plan` endpoint as the leave-by brain. No build order committed yet. Endpoint spec: [docs/plan-endpoint-spec.md](docs/plan-endpoint-spec.md).
