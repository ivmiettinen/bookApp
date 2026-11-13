module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  overrides: [
    {
      files: ['**/*.jsx'],
      rules: { 'no-unused-vars': 'off' },
    },
    {
      files: ['**/*.test.js', '**/*.test.jsx', '**/setupTests.js', '**/__mocks__/*.js'],
      globals: {
        vi: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        describe: 'readonly',
        it: 'readonly',
      },
    },
  ],
  rules: {
    'no-undef': 'error',
    'no-unused-vars': 'warn',
  },
};
