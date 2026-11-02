# Technical Debt & Future Improvements

Tracks remaining work for ferry-app. Completed items are removed — the history lives in commit messages.

## Next up

- **Ship + road-test 1.10.0** (drive-around + car spots on the Lock Screen, built 2026-11-01): check in
  the car that Apple Maps times look right, the drive-around/ferry call matches reality (Renton,
  Northgate), and the spots count keeps updating with the phone locked (background keep-alive).

## Medium Priority

- **Validate the CarPlay screen in the simulator** — built but not yet seen (2026-11-01). Prebuild with
  `FERRY_CARPLAY=1 npx expo prebuild -p ios --clean`, `npx expo run:ios`, open the simulator's CarPlay
  display (I/O → External Displays → CarPlay) and check the "Best from here" list
  (`modules/ferry-live/ios/FerryCarPlay.swift`): best sailing + leave-by, "Missed it? Next", other route,
  and the waiting/no-sailing states. Also check the Live Activity's `.small` view on the CarPlay dashboard.
- **CarPlay Driving Task entitlement — requested 2026-11-01, waiting on Apple** (granted to the team as a
  managed capability; no app-specific form fields). Once granted: enable it on `com.ferrytracker.app`,
  drop the `FERRY_CARPLAY` gate in `plugins/withCarPlay.js`, regenerate profiles (`eas credentials`) and
  ship its own native build (1.10.0 went out without it). If the car spots keep-alive proves flaky on the
  road, fold Live Activity push updates (APNs + push entitlement) into that same build.
- **Live Activity re-planning in the background (bike)** — car activities stay fresh via the background
  location keep-alive; the bike leave-by still only re-plans while the app is open. From 1.10.0 the native
  keep-alive is in the binary, so extending it to bike activities is JS-only (OTA) — weigh battery first.

## Low Priority

- **Companion apps (Watch + CarPlay)** — planning captured in [docs/companion-apps-plan.md](docs/companion-apps-plan.md). Centers on the core Ferry-tab data (departure, leave-by, ETA); shared backend `/plan` endpoint as the leave-by brain (built 2026-11-01, car-only; bike mode + recorded transit times still deferred). Endpoint spec: [docs/plan-endpoint-spec.md](docs/plan-endpoint-spec.md).
