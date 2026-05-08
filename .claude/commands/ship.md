---
description: Orchestrate the deployment flow for ferry-app — tests, docs, iOS sim testing, commit/push to main, preview EAS, gate, then production EAS.
---

You are running the `/ship` deployment playbook for ferry-app. Your job is to drive a 6-step deploy with two user-gated checkpoints, delegating each phase to the specialized subagent that already exists for it. Never reimplement work the subagents can do.

# Pre-flight (before any step)

Run these checks. If any fail, stop and ask the user how to proceed.

1. Confirm working dir is `/Users/brandontaylor/Coding/ferry-app`. If not, `cd` there first.
2. Confirm current branch is `main` (the only branch). If on a detached HEAD or stray branch, ask before proceeding.
3. Read git state:
   - `git status` — note dirty files (expected).
   - `git fetch origin && git log HEAD..origin/main --oneline` — make sure local isn't behind remote. If behind, ask before proceeding (rebase or merge first).
4. Inspect the diff scope. `git diff --name-only origin/main...HEAD` plus uncommitted modifications. Categorize:
   - **Native**: `app.json`, `app.config.js` (if it exists), `eas.json`, `package.json` if native deps changed, anything under `ios/` or `android/`, asset changes that affect the bundle (icons, splash, fonts).
   - **JS/TS-only**: anything under `app/`, `src/`, plus root-level JS/TS that doesn't fall into the native list.
   - **Backend**: anything under `infra/` (CDK stack, lambdas).
5. **Backend safety check**: if any Backend file is in the diff, the mobile changes likely depend on infra changes that aren't deployed yet. Ferry-app uses CDK (`infra/cdk.json`), not SAM — there's no `sam-deployer` agent that fits, so ask the user how the backend deploy should run (typically `cd infra && npx cdk deploy`). Stop and wait for confirmation that backend is deployed before proceeding with mobile deploy. Never silently proceed if backend is undeployed.
6. Decide the EAS path for steps 5 and 6:
   - **Only** JS/TS-only files changed → OTA path (delegate to `eas-update`).
   - Any Native files changed → full rebuild path (delegate to `eas-release`).
   - Surface the choice and reasoning before kicking off step 5.

Report a short pre-flight summary before starting step 1. Wait for the user to acknowledge.

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

# Step 3: iOS simulator testing

ferry-app is iOS-focused (`com.ferrytracker.app`). No web testing — skip web entirely regardless of changes.

From the project root, launch the iOS simulator:
```
npx expo start --ios
```
(run in background so Metro stays alive.)

Tell the user the simulator should launch automatically and Metro is now serving. Give them a short verification checklist tied to the change. **Do not proceed** until they confirm.

# Step 4: Confirm testing → commit + push

Ask the user explicitly:

> iOS sim testing done? Should I commit the working tree and push to `main`?

If yes, delegate to the `git-pusher` agent. It will:
- Verify branch and remote state.
- Stage modified files (including any docs from step 2).
- Write a commit message reflecting the change.
- Push to `origin/main`.

Surface the commit SHA when done.

If the user says no, stop the playbook. They can re-run `/ship` when ready.

# Step 5: Preview EAS deploy

Use the EAS path you decided in pre-flight, targeting the `preview` channel/profile:

**OTA path (JS/TS-only changes):**
Delegate to the `eas-update` agent. Tell it:
- Target channel: `preview` (one channel — there's no same-tier sibling for preview alone in ferry-app).
- Message: derive from the commit message in step 4.
- The agent will read `eas.json` and prefix the full env block from the `preview` profile (`EXPO_PUBLIC_APP_ENV=prod`, `EXPO_PUBLIC_API_URL=...`).

**Full rebuild path (native changes):**
Delegate to the `eas-release` agent. Tell it:
- Profile: `preview`.
- Platform: `ios` (Android only if user explicitly asks — `preview` distributes as `.apk` for Android internal install, but iOS is the default goal).
- Build only — no submit (preview is `distribution: "internal"`, not store-bound).
- After the build, EAS provides an install link for the iOS internal build that the user can open on their device.

This takes ~25 min. Tell the user upfront so they can step away.

# Step 6: Confirm preview verified → production EAS deploy

After step 5 finishes, ask the user explicitly:

> Preview build looks good on your device? Ready to ship to production TestFlight?

If yes:

**OTA path:**
Delegate to `eas-update`. Channel: `production`. The `production` profile shares an env signature with `preview` in ferry-app (both `EXPO_PUBLIC_APP_ENV=prod`, same API URL), so this is functionally the same bundle as step 5 going to a different audience.

**Full rebuild path:**
Delegate to `eas-release`. Profile: `production`. Build, then submit to TestFlight (`com.ferrytracker.app`).

After completion, remind the user:
- OTA path: TestFlight users force-quit and relaunch *twice* to pick up the bundle.
- Full rebuild path: TestFlight processing takes 5-30 min after submit; testers added as Internal Testers will get an email when it's available.

If the user says no in step 6, stop. The preview build remains live for further verification; they can re-run `/ship` later to ship prod.

# Reporting

At the end of the playbook, output a single summary:

```
Branch: main @ <short SHA>
Commits shipped: <short SHA list>
Tests: <count> passed
Docs updated: <files>
Preview EAS: <ota | rebuild> → <result>
Production EAS: <ota | rebuild> → <result>
Backend deploy: <skipped | deployed | n/a>
Time elapsed: <approx>
```

# Things to never do

- Never skip the pre-flight backend check. A mobile OTA hitting a CDK stack with an undeployed Lambda dependency will silently 500.
- Never proceed past steps 4 or 6 without an explicit user yes. These gates are designed-in.
- Never push to `production` channel (or rebuild for `production` profile) before a successful `preview` deploy. The preview is the smoke test for prod; skipping it defeats the whole point of having two channels.
- Never re-run `eas-release` rebuilds when an OTA would do. EAS build minutes are billable and rebuild takes 25 min vs 2.
- Never run `git push --force` or `git reset --hard` as part of any step.
- Never mark the playbook complete if any step errored. Surface the failure clearly and stop.
- Never test in a web browser as part of this flow. ferry-app is mobile-only by design even though Expo's web bundler is configured in `app.json`.
