// @ts-check
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig(
  {
    ignores: [
      'node_modules/',
      '.features-gen/',
      'reports/',
      'test-results/',
      'playwright-report/',
      'blob-report/',
      'logs/',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    rules: {
      // A missing `await` on a Playwright call is the most common source of flaky tests.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      'no-restricted-properties': [
        'error',
        {
          property: 'waitForTimeout',
          message: 'Fixed sleeps are not allowed. Use web-first assertions or explicit waits.',
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'writable',
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
  },
  prettier,
);
