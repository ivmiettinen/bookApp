module.exports = {
  root: true,
  plugins: ['react-hooks'],
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
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: { 'no-undef': 'off' },
    },
    {
      files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}', '**/setupTests.{js,ts}', '**/__mocks__/*.{js,ts}'],
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
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-undef': 'error',
    'no-unused-vars': 'warn',
  },
};
