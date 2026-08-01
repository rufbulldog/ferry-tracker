---
description: Orchestrate the deployment flow for ferry-app — tests, docs, iOS sim testing, then commit/push to main and ship straight to production EAS (no preview stage).
---

You are running the `/ship` deployment playbook for ferry-app. Your job is to drive a 5-step deploy with **one** user-gated checkpoint (after iOS simulator testing), delegating each phase to the specialized subagent that already exists for it. Never reimplement work the subagents can do.

**No preview/internal EAS stage.** The user verifies changes in the iOS simulator and, as the sole user of the app, ships straight to production TestFlight — there is no `preview`-channel smoke test in this flow. (The `preview` profile still exists in `eas.json`; this playbook just doesn't use it.)

# Pre-flight (before any step)

Run these checks. If any fail, stop and ask the user how to proceed.

1. Confirm working dir is `/Users/brandontaylor/Coding/ferry-app`. If not, `cd` there first.
2. Confirm current branch is `main` (the only branch). If on a detached HEAD or stray branch, ask before proceeding.
3. Read git state:
   - `git status` — note dirty files (expected).
   - `git fetch origin && git log HEAD..origin/main --oneline` — make sure local isn't behind remote. If behind, ask before proceeding (rebase or merge first).
4. Inspect the diff scope. `git diff --name-only origin/main...HEAD` plus uncommitted modifications. Categorize:
   - **Native**: `app.json`, `app.config.js` (if it exists), `eas.json`, `package.json` if native deps changed, anything under `ios/` or `android/`, asset changes that affect the bundle (icons, splash, fonts).
     - **Exception — the version bump does not count as native.** A change to `app.json`'s `expo.version` *only* (the per-ship bump from step 7) ships fine over OTA — the version string is read at runtime from the update's embedded config via `Constants.expoConfig.version`, so it does not require a rebuild. Do **not** let a version-only `app.json` diff flip the ship to the rebuild path. A change to any *other* `app.json` field — including `runtimeVersion`, `ios.buildNumber`, permissions, plugins, icons — **does** count as native.
   - **JS/TS-only**: anything under `app/`, `src/`, plus root-level JS/TS that doesn't fall into the native list.
   - **Backend**: anything under `infra/` (CDK stack, lambdas).
5. **Backend safety check**: if any Backend file is in the diff, the mobile changes likely depend on infra changes that aren't deployed yet. Ferry-app uses CDK (`infra/cdk.json`), not SAM — there's no `sam-deployer` agent that fits, so ask the user how the backend deploy should run (typically `cd infra && npx cdk deploy`). Stop and wait for confirmation that backend is deployed before proceeding with mobile deploy. Never silently proceed if backend is undeployed.
6. Decide the EAS path for the production deploy (step 5):
   - **Only** JS/TS-only files changed → OTA path (delegate to `eas-update`).
   - Any Native files changed → full rebuild path (delegate to `eas-release`).
   - Surface the choice and reasoning in the pre-flight summary.
7. **Bump the app version.** The version shown in the app's Settings screen is sourced from `app.json` `expo.version` (single source of truth — `app/(tabs)/settings.tsx` reads `Constants.expoConfig.version`). Increment it on **every** ship so each shipped change is identifiable:
   - Pick the level from the diff scope categorized in step 4:
     - **Patch** (`x.y.Z+1`) — the default: fixes, refactors, chores, and any JS/TS-only change with no new user-facing feature.
     - **Minor** (`x.Y+1.0`) — a new user-facing feature.
     - **Major** (`X+1.0.0`) — only when the user explicitly calls for it.
   - Edit `app.json` `expo.version` to the new number. This edit is part of the working tree committed in step 4. (It does not trigger the rebuild path — see the step 4 Native exception.)
   - **`runtimeVersion` is pinned** to a fixed string in `app.json` (e.g. `"1.0.0"`), intentionally decoupled from `version` so OTA ships can bump `version` freely without orphaning updates. **On the OTA path, leave `runtimeVersion` untouched.**
   - **On the full-rebuild path only** (native changes → `eas-release`), also bump `runtimeVersion` to the new `version` string, because a new native binary is going out and the OTA-compatibility boundary should move with it. Do this in the same `app.json` edit, before the step 5 production rebuild handoff.
   - Surface the chosen bump in the pre-flight summary (e.g. "bumping 1.0.1 → 1.0.2, patch; runtimeVersion unchanged") so the user can override the level before you proceed.

Report a short pre-flight summary before starting step 1 — include the version bump line. Wait for the user to acknowledge.

# Step 1: Tests

Delegate to the `test-runner` agent. Pass it the list of changed files and instruct it to:
- Add new tests covering the changed code paths.
- Run the full suite.
- Report pass/fail counts and any failures.

If tests fail, stop. Do not proceed until they pass.

> Note: ferry-app may not have a Jest config wired up yet. If `test-runner` reports no test runner configured, surface that and ask the user whether to set one up or skip tests for this ship.

# Step 2: Documentation

Delegate to the `doc-updater` agent. Pass it the list of changed files and ask it to sync any of these that are affected:
- `README.md`, `CLAUDE.md`, `AGENTS.md` (if present).
- Any feature-specific README under `app/` or `src/`.
- `infra/README.md` if backend was touched.

The doc-updater leaves files modified; they get picked up by the commit in step 4.

**Reconcile the auto-generated spec.** This repo's `docs/spec/` is generated by the shared `spec` CLI (lives in private [`rufbulldog/dev-utils`](https://github.com/rufbulldog/dev-utils), driven by [`spec.config.json`](../../spec.config.json)). After doc-updater runs, reconcile specs to the diff so they commit together in step 4:
```bash
spec extract
```
If `spec` isn't on PATH, link it once: `cd <path>/dev-utils/packages/spec && npm link`. This keeps the L1 (per-file) + L2 (per-folder) specs for `app/`, `src/`, and the CDK `infra/` in sync as code moves. There's no CI spec-gate in this repo (iOS-only, no GitHub Actions), so this local reconcile is the enforcement — don't skip it.

# Step 3: iOS simulator testing

ferry-app is iOS-focused (`com.ferrytracker.app`). No web testing — skip web entirely regardless of changes.

From the project root, launch the iOS simulator:
```
npx expo start --ios
```
(run in background so Metro stays alive.)

Tell the user the simulator should launch automatically and Metro is now serving. Give them a short verification checklist tied to the change. **Do not proceed** until they confirm.

# Step 4: Confirm sim testing → commit + push + production deploy (the one gate)

This is the single user-gated checkpoint. Ask the user explicitly:

> iOS sim testing done? Ready to commit the working tree, push to `main`, and ship straight to production TestFlight?

If the user says no, stop the playbook. Nothing has been committed or deployed; they can re-run `/ship` when ready.

If yes, first delegate to the `git-pusher` agent. It will:
- Verify branch and remote state.
- Stage modified files (including any docs/specs from step 2).
- Write a commit message reflecting the change.
- Push to `origin/main`.

Surface the commit SHA when done, then proceed directly to step 5 — no second gate, since the user authorized the production ship in this same step.

# Step 5: Production EAS deploy

Use the EAS path you decided in pre-flight, targeting the `production` channel/profile.

**OTA path (JS/TS-only changes):**
Delegate to the `eas-update` agent. Tell it:
- Target channel: `production`.
- Message: derive from the commit message in step 4.
- The agent reads `eas.json` and prefixes the full env block from the `production` profile (`EXPO_PUBLIC_APP_ENV=prod`, `EXPO_PUBLIC_API_URL=...`). It uses `--clear-cache` (not `--clear`) on the first publish.

**Full rebuild path (native changes):**
First confirm the step 7 version bump also moved `runtimeVersion` to the new `version` string (rebuild path only). Then delegate to the `eas-release` agent. Tell it:
- Profile: `production`.
- Platform: `ios` (Android only if the user explicitly asks).
- Build, then submit to TestFlight (`com.ferrytracker.app`).
- This takes ~25 min plus TestFlight processing. Tell the user upfront so they can step away.

After completion, remind the user:
- OTA path: TestFlight users force-quit and relaunch *twice* to pick up the bundle.
- Full rebuild path: TestFlight processing takes 5-30 min after submit; testers added as Internal Testers get an email when it's available.

# Reporting

At the end of the playbook, output a single summary:

```
Branch: main @ <short SHA>
Version: <old> → <new> (<patch|minor|major>); runtimeVersion: <unchanged | old → new>
Commits shipped: <short SHA list>
Tests: <count> passed
Docs updated: <files>
Production EAS: <ota | rebuild> → <result>
Backend deploy: <skipped | deployed | n/a>
Time elapsed: <approx>
```

# Things to never do

- Never skip the pre-flight backend check. A mobile OTA hitting a CDK stack with an undeployed Lambda dependency will silently 500.
- Never proceed past step 4 (the single gate) to commit/push or the production deploy without an explicit user yes. This gate is designed-in.
- Never re-run `eas-release` rebuilds when an OTA would do. EAS build minutes are billable and rebuild takes 25 min vs 2.
- Never bump `runtimeVersion` on an OTA-only ship. It's pinned on purpose; changing it to a new value orphans every installed build's OTA channel until a matching native rebuild lands. Only move it on the full-rebuild path, alongside a new binary.
- Never skip the step 7 version bump. Every ship increments `app.json` `expo.version` so the Settings screen reflects what's deployed.
- Never run `git push --force` or `git reset --hard` as part of any step.
- Never mark the playbook complete if any step errored. Surface the failure clearly and stop.
- Never test in a web browser as part of this flow. ferry-app is mobile-only by design even though Expo's web bundler is configured in `app.json`.
