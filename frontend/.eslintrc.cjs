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
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: { 'no-undef': 'off' },
    },
    {
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}', '**/setupTests.ts', '**/__mocks__/*.ts'],
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
