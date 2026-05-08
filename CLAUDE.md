# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ferry Tracker — a React Native (Expo) app for tracking Washington State Ferries in real-time. iOS-focused, distributed via TestFlight (`com.ferrytracker.app`). Single-platform target: mobile only. The Expo web bundler is configured in `app.json` but the app is **not** intended to run in a browser; do not include web testing in any deploy flow.

## Development Commands

```bash
npm start          # expo start (Metro bundler + dev menu)
npm run ios        # expo run:ios (build + launch in iOS simulator)
npm run android    # expo run:android
```

For OTA-style dev iteration use `npm start` plus the iOS simulator. `npm run ios` does a full native rebuild and is slower.

## Repository Layout

- `app/` — Expo Router routes and screens.
- `src/` — shared components, hooks, services.
- `assets/` — icons, splash, fonts.
- `infra/` — backend infrastructure as **AWS CDK** (`cdk.json`, `bin/`, `lib/`, `lambda/`). Note: this is CDK, not SAM — there is no `deploy-sam.sh` here.
- `keys/` — Apple Store Connect API key (`.p8`). Gitignored. Required for `eas submit`.
- `app.json` — Expo config. Bundle ID: `com.ferrytracker.app`. Both iOS and Android share the same package name.
- `eas.json` — EAS build/submit profiles. Three profiles: `development`, `preview`, `production`.

## Branch Model

**Single branch: `main`.** No dev/prod branch split. All work commits and pushes to `main` directly. Never assume a `dev` branch exists; never try to merge between branches in this repo.

## EAS Profiles

| Profile | Distribution | Channel | `EXPO_PUBLIC_APP_ENV` | Use case |
|---|---|---|---|---|
| `development` | internal | `development` | `dev` | Dev client (Mac required) |
| `preview` | internal | `preview` | `prod` | Internal smoke build before TestFlight; iOS internal install link / Android `.apk` |
| `production` | store | `production` | `prod` | Prod TestFlight (`com.ferrytracker.app`) |

Both `preview` and `production` point at the **same backend API** (`EXPO_PUBLIC_API_URL` in `eas.json`) and the **same env signature**. The two channels exist to give a smoke-test stage (`preview` on your device) before shipping to TestFlight (`production`), not because they target different backends.

## Mobile App Release Workflow

Mobile-app releases follow a 6-step playbook codified as the `/ship` slash command (`.claude/commands/ship.md`). When the user asks to "ship", "deploy", "release", or otherwise indicates they're ready to push changes, run `/ship` rather than improvising the steps.

**Two user-gated checkpoints** (do not bypass):
1. After iOS simulator testing, before commit + push.
2. After preview build verification on device, before shipping `production` TestFlight.

**EAS path is auto-picked from the diff:**
- JS/TS/asset-only changes → OTA update via `eas-update` agent (~2 min).
- Native changes (`app.json`, `eas.json`, native deps, icons, permissions, `ios/`, `android/`) → full `eas build` + `eas submit` via `eas-release` agent (~25 min).
- Surface the choice before running so the user can override.

**Critical OTA rule:** `eas update` reads env vars from the local shell, not from `eas.json` build profiles. Every `eas update` must be prefixed with all env vars from the matching profile (e.g. `EXPO_PUBLIC_APP_ENV=prod EXPO_PUBLIC_API_URL=https://...`). The `eas-update` agent enforces this — always delegate OTA work to it rather than running `eas update` directly.

**Backend safety check before mobile deploy:** if a mobile change depends on CDK changes that aren't deployed, mobile deploys will silently break. `/ship` checks `infra/` for diff and stops if found; respect the gate. Backend deploy command is roughly:
```bash
cd infra
npx cdk deploy
```
(verify by reading `infra/README.md` or asking — backend deploy mechanics are not yet codified into a dedicated agent for this repo.)

## Backend (CDK)

The backend lives in `infra/` and is deployed with AWS CDK, not SAM. `infra/cdk.json` is the entry point. The mobile app currently hits `https://yv8hqe5rgc.execute-api.us-west-2.amazonaws.com/prod` (per `eas.json`). When backend Lambdas or API shape changes, deploy the CDK stack before pushing mobile changes that depend on the new shape.

There is no equivalent of kamilche-cabin's `deploy-sam.sh` wrapper here. CDK deploys go via `npx cdk deploy` from `infra/`. There's no `sam-deployer` agent that fits this repo — handle backend deploys manually until that gap is closed.

## Things to remember

- **iOS-only by default.** Don't suggest `eas submit android` unless the user has explicitly confirmed Google Play Console + service account JSON are configured.
- **No web testing.** Even though `app.json` configures a web bundler, the app isn't designed to run in a browser.
- **Same-env channels.** `preview` and `production` share an env signature, so an OTA bundle pushed to one is functionally identical to one pushed to the other — but they reach different audiences (your device vs. TestFlight testers). Don't push to one and forget the other if you intend to ship to everyone.
- **No Jest config currently wired.** If `test-runner` reports no test runner, surface that and ask whether to set one up or skip tests for this ship.
