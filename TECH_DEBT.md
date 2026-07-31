# Technical Debt & Future Improvements

Tracks remaining work for ferry-app. Completed items are removed — the history lives in commit messages.

## High Priority

- [ ] **`src/utils` ⇄ `src/store` circular dependency** — `utils` imports `store` and `store` imports `utils` (surfaced by the spec architecture graph, [`docs/spec/_systems/architecture.md`](docs/spec/_systems/architecture.md)). Break the cycle — move the shared piece to a leaf module, or invert one direction.

## Medium Priority

- [ ] **ESLint warning backlog** — `npm run lint` passes (0 errors) but reports ~96 warnings, mostly the React-Compiler `react-hooks/*` rules (kept as warnings in the shared `@rufbulldog/eslint-config`). Work them down, then opt those rules up to `error` in a local override.
- [ ] **`infra/` (CDK) isn't linted** — the shared Expo ESLint config doesn't fit CDK Node code, so lint is scoped to `app src`. Add a separate ESLint setup under `infra/` if you want it covered.

## Low Priority

_(none yet)_
