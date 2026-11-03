# Technical Debt & Future Improvements

Tracks remaining work for ferry-app. Completed items are removed — the history lives in commit messages.

## Next up

- **Ship + road-test 1.10.0** (drive-around + car spots on the Lock Screen, built 2026-11-01): check in
  the car that Apple Maps times look right, the drive-around/ferry call matches reality (Renton,
  Northgate), and the spots count keeps updating with the phone locked (background keep-alive).

## Medium Priority

- **CarPlay detail screen (1.11.1)** — seen on the car 2026-11-02 (list works in 1.11.0, but taps spun).
  1.11.1 adds spots to each row and a tap-through detail screen; confirm both on the head unit. If the car
  spots keep-alive proves flaky on the road, add Live Activity push updates (APNs + push entitlement).
- **Live Activity re-planning in the background (bike)** — car activities stay fresh via the background
  location keep-alive; the bike leave-by still only re-plans while the app is open. From 1.10.0 the native
  keep-alive is in the binary, so extending it to bike activities is JS-only (OTA) — weigh battery first.

## Low Priority

- **Companion apps (Watch + CarPlay)** — planning captured in [docs/companion-apps-plan.md](docs/companion-apps-plan.md). Centers on the core Ferry-tab data (departure, leave-by, ETA); shared backend `/plan` endpoint as the leave-by brain (built 2026-11-01, car-only; bike mode + recorded transit times still deferred). Endpoint spec: [docs/plan-endpoint-spec.md](docs/plan-endpoint-spec.md).
