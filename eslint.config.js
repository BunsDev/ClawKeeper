// file: eslint.config.js
// description: ESLint configuration for ClawKeeper enforcing snake_case conventions
// reference: CLAUDE.md, package.json

import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      // Naming conventions
      // ClawKeeper uses snake_case by convention (see CLAUDE.md)
      'camelcase': 'off',
      
      // Code quality - use TS-aware version
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off', // We use console for logging
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Best practices
      'eqeqeq': ['error', 'always'],
      'no-throw-literal': 'error',
      'no-return-await': 'off', // Deprecated; return await is valid in try/catch
      
      // TypeScript-specific (handled by tsc)
      'no-undef': 'off', // TypeScript handles this
    },
  },
  {
    // Ignore patterns
    ignores: [
      'node_modules/**',
      'dist/**',
      'dashboard/**', // Dashboard has its own config
      'db/**',
      'scripts/**',
      'memory/**',
      'src/demo/**', // Demo data can have any naming
    ],
  },
];
