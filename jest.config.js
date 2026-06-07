/**
 * App-level Jest config (ts-jest).
 *
 * Scoped to `src/` so it never picks up the separate CDK suite under `infra/`
 * (which has its own jest config). Uses tsconfig.jest.json — a standalone
 * CommonJS tsconfig — rather than the Expo base (module: "preserve",
 * moduleResolution: "bundler"), which Node/Jest can't run directly.
 *
 * @type {import('jest').Config}
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
};
