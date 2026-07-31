// Shared ESLint flat config — see @rufbulldog/eslint-config in rufbulldog/dev-utils.
const shared = require('@rufbulldog/eslint-config');

module.exports = [
  ...shared,
  {
    // Local override: the React-Compiler `react-hooks/*` rules ship as warnings in
    // the shared config. This app's backlog is now at zero — with the handful of
    // intentional cases (wall-clock reads, external-system effect syncs) disabled
    // inline — so promote them to errors to keep the backlog from regrowing.
    //
    // `react-hooks/exhaustive-deps` is intentionally left as a warning: unlike the
    // compiler rules, auto-satisfying it can mask genuine dependency bugs, so it
    // stays advisory rather than blocking.
    name: 'ferry-app/react-hooks-errors',
    rules: {
      'react-hooks/refs': 'error',
      'react-hooks/purity': 'error',
      'react-hooks/set-state-in-effect': 'error',
    },
  },
];
