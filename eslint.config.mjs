import pluginJs from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import optimizeRegex from 'eslint-plugin-optimize-regex';
import preferArrow from 'eslint-plugin-prefer-arrow';
import prettier from 'eslint-plugin-prettier';
import promise from 'eslint-plugin-promise';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import pluginReactMemo from 'eslint-plugin-react-memo';
import reactPerf from 'eslint-plugin-react-perf';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tailwindcss from 'eslint-plugin-tailwindcss';
import globals from 'globals';

import customPlugin from './eslint-rules/eslint-plugin-custom.js';

// eslint-disable-next-line
export default [
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'prefer-arrow': preferArrow,
      import: pluginImport,
      'simple-import-sort': simpleImportSort,
      prettier,
      promise,
      tailwindcss,
      'react-hooks': reactHooks,
      'react-perf': reactPerf,
      'jsx-a11y': jsxA11y,
      'optimize-regex': optimizeRegex,
      'react-memo': pluginReactMemo,
      custom: customPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Custom
      'custom/no-invalid-memo-compare': 'error',

      ...pluginReact.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // ...jsxA11y.configs.recommended.rules,

      // Prettier
      'prettier/prettier': 'error',

      // Import rules
      'import/no-default-export': 'error',
      'import/default': 'error',
      'import/export': 'error',
      'import/named': 'error',
      'import/namespace': 'error',
      'import/no-duplicates': 'error',
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',
      'import/no-unresolved': 'error',

      // Sorting imports
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^prismjs(/.*|$)'],
            ['^react$', '^react-dom$', '^react-router'],
            ['^antd', '^@mui', '^@chakra-ui', '^@?\\w'],
            ['^lodash', '^@?\\w'],
            ['^@/'],
            ['^\\./(?!.*\\.(css|scss)$)', '^\\.\\.(?!.*\\.(css|scss)$)'],
            ['^.+\\.s?css$'],
            ['^.+\\.(png|jpg|jpeg|gif|svg|webp|avif|ico|bmp|tiff|json)$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // Code style rules
      quotes: ['error', 'single', { avoidEscape: true }],
      camelcase: ['warn', { properties: 'always' }],
      'sort-keys': [
        'off', // Explicitly kept off
        'asc',
        {
          caseSensitive: false,
          natural: true,
          minKeys: 2,
        },
      ],

      // Functions
      'prefer-arrow/prefer-arrow-functions': [
        'warn',
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false,
        },
      ],

      // Promises
      'promise/prefer-await-to-then': 'warn',
      'require-await': 'warn',

      // React
      'react/no-danger': 'warn',
      'react/style-prop-object': 'warn',
      'react/display-name': 'off', // Explicitly kept off
      'react/require-optimization': 'warn',
      'react/jsx-no-bind': 'warn',
      'react/jsx-no-constructed-context-values': 'warn',
      'react/no-object-type-as-default-prop': 'warn',
      'react/no-unstable-nested-components': 'error',
      'react-memo/require-memo': 'warn',
      'react-memo/require-usememo': 'warn',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // React Perf
      'react-perf/jsx-no-new-object-as-prop': 'warn',
      'react-perf/jsx-no-new-array-as-prop': 'warn',
      'react-perf/jsx-no-new-function-as-prop': 'warn',

      // Optimize Regex
      'optimize-regex/optimize-regex': 'off', // Explicitly kept off

      // Styling
      'tailwindcss/classnames-order': [
        'warn',
        {
          order: [
            'layout',
            'positioning',
            'box-model',
            'typography',
            'background',
            'border',
            'effects',
            'interactivity',
            'animations',
          ],
          groupByResponsive: true,
          breakClassNamesByScreen: true,
        },
      ],
      'tailwindcss/no-custom-classname': [
        'warn',
        {
          whitelist: ['custom\\-.*'],
        },
      ],
      'tailwindcss/enforces-shorthand': 'warn',

      // Formatting
      'max-len': ['error', { code: 120, ignoreUrls: true, ignoreStrings: true }],
      'padded-blocks': ['error', 'never'],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'arrow-body-style': ['error', 'as-needed'],
      'arrow-parens': ['error', 'always'],
      'display-name': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
