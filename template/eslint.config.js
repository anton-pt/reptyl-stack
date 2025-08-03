import eslintJs from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import { createRequire } from 'module';
import { dirname } from 'path';
import * as tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const requireExtensions = require('eslint-plugin-require-extensions');
const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  // Global ignores
  {
    ignores: [
      '.templates/**',
      '**/pond-lab-app/src/models.ts',
      '**/pond-lab-server/src/models.ts',
      'eslint.config.cjs',
      'package-lock.json',
      'dist/**',
      '**/dist/**',
      '**/node_modules/**',
      '.turbo/**',
      '**/*.json',
      '**/*.{yml,yaml}',
      '**/*.md',
      '**/*.css',
    ],
  },

  // eslintJs recommended config
  eslintJs.configs.recommended,

  // Configuration for JS/CJS/MJS files that should skip TypeScript parsing
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // Configuration for eslint.config.js - using non-type-checked rules
  {
    files: ['eslint.config.js'],
    languageOptions: {
      globals: { ...globals.node },
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // Basic stylistic rules without type checking
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  // TypeScript ESLint configs with type checking for regular TS files
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['eslint.config.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: tseslint.parser,
      parserOptions: {
        project: [
          './tsconfig.json',
          './pond-lab-app/tsconfig.json',
          './pond-lab-server/tsconfig.json',
        ],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs.stylistic.rules,
      // Add type-aware rules for TS files but not for the config file
      '@typescript-eslint/dot-notation': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  },

  // React ESLint config for React components
  {
    files: ['**/*.{jsx,tsx}'],
    ...eslintReact.configs['recommended-type-checked'],
  },

  // Common rules for all JavaScript and TypeScript files
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      'require-extensions': requireExtensions,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'require-extensions/require-extensions': 'error',
    },
  },
];
