// ESLint flat config for the CDK backend (infra/).
//
// The app's shared Expo config (@rufbulldog/eslint-config, wired up at the repo
// root) targets React Native and doesn't fit this Node/CDK package, so infra/
// gets its own minimal typescript-eslint setup. Run with `npm run lint` here.
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  // Compiled output and CDK synth artifacts — never lint these.
  { ignores: ['cdk.out/**', 'node_modules/**', '**/*.js', '**/*.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      // TypeScript's own compiler resolves identifiers, so ESLint's no-undef is
      // redundant here and would false-positive on Node globals (process, Buffer…).
      'no-undef': 'off',
    },
  },
);
