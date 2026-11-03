# Technical Debt & Future Improvements

Tracks remaining work for ferry-app. Completed items are removed — the history lives in commit messages.

## Next up

- **Ship + road-test 1.10.0** (drive-around + car spots on the Lock Screen, built 2026-11-01): check in
  the car that Apple Maps times look right, the drive-around/ferry call matches reality (Renton,
  Northgate), and the spots count keeps updating with the phone locked (background keep-alive).

## Medium Priority

- **Check the CarPlay screen on a real head unit / in Device Hub** — the entitlement was granted and
  enabled 2026-11-02 and ships in 1.11.0. The phone app was verified running under the new scene lifecycle
  in the simulator; the CarPlay list itself (`modules/ferry-live/ios/FerryCarPlay.swift`: best sailing +
  leave-by, "Missed it? Next", other route, waiting/no-sailing states) hasn't been seen yet — `simctl io
  screenConfig --display=Wireless power on` lights the screen but doesn't start a CarPlay session; Device Hub
  does. If the car spots keep-alive proves flaky on the road, add Live Activity push updates (APNs + push
  entitlement) in a later native build.
- **Live Activity re-planning in the background (bike)** — car activities stay fresh via the background
  location keep-alive; the bike leave-by still only re-plans while the app is open. From 1.10.0 the native
  keep-alive is in the binary, so extending it to bike activities is JS-only (OTA) — weigh battery first.

## Low Priority

- **Companion apps (Watch + CarPlay)** — planning captured in [docs/companion-apps-plan.md](docs/companion-apps-plan.md). Centers on the core Ferry-tab data (departure, leave-by, ETA); shared backend `/plan` endpoint as the leave-by brain (built 2026-11-01, car-only; bike mode + recorded transit times still deferred). Endpoint spec: [docs/plan-endpoint-spec.md](docs/plan-endpoint-spec.md).
