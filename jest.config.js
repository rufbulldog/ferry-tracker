/**
 * App-level Jest config. Extends the shared @rufbulldog/jest-preset base and
 * overrides only what's ferry-specific: scoped to `src/` (so it never picks up
 * the separate CDK suite under `infra/`), and a ts-jest transform pinned to
 * tsconfig.jest.json (a standalone CommonJS tsconfig — the Expo base uses
 * module: "preserve" / moduleResolution: "bundler", which Node/Jest can't run).
 *
 * @type {import('jest').Config}
 */
module.exports = {
  ...require('@rufbulldog/jest-preset/expo'),
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
};
