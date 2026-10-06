# Ship profile — ferry-app

Read by the global `/ship` skill (`dev-utils/claude-global/skills/ship`). Shared steps live there;
this file holds only what's specific to ferry-app.

## Repo
- Path: `/Users/brandontaylor/Coding/ferry-app`
- Kind: Expo iOS app (EAS) — see the skill's `expo-eas.md`
- Ship branch: `main` (single branch). No preview stage: the user is the only user and ships
  straight to production TestFlight after the simulator check.
- Remote: `rufbulldog/ferry-tracker`

## Lanes
- Standard Expo lanes (`expo-eas.md`).
- **Backend** — `infra/**` (AWS CDK: Lambda, DynamoDB, API Gateway, EventBridge). No deploy agent fits
  CDK: ask the user how to deploy (typically `cd infra && npx cdk deploy`) and wait for confirmation
  that it's live before any app deploy. A mobile OTA hitting an undeployed Lambda dependency will 500.

## Checks
- `npx tsc --noEmit`
- `npm run lint` (scoped to `app src`; `infra` is CDK with its own config)
- `npm test` (Jest via `@rufbulldog/jest-preset/expo`)
- Backend has its own suite + lint: `cd infra && npm test && npm run lint` — run both when `infra/**` changed.

## Verify
- iOS simulator: `npx expo run:ios --device "iPhone 17 Pro"` (works on Xcode 27 since the SDK 57
  upgrade), then Metro on 8081. Bundle id `com.ferrytracker.app`. No web testing,
  ever (the web bundler is configured but the app is mobile-only).

## Deploy
- **OTA:** `eas-update` → channel `production`. Prefix the **full env block** of the `production`
  profile in `eas.json` (`EXPO_PUBLIC_APP_ENV=prod`, `EXPO_PUBLIC_API_URL=…`) and pass `--clear-cache`.
- **Rebuild:** `eas-release` → profile `production`, iOS, submit to TestFlight (`com.ferrytracker.app`).
  Internal testers get an email when it's processed.

## Versioning
- `app.json` `version` + pinned `runtimeVersion` (rules in `expo-eas.md`). The Settings screen reads
  the **native binary** (`expo-application`, manifest fallback), so on-device it changes only with a
  rebuild.
