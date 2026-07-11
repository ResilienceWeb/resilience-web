import eslint from '@eslint/js'
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query'
import eslintReact from '@eslint-react/eslint-plugin'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import promisePlugin from 'eslint-plugin-promise'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import nextPlugin from '@next/eslint-plugin-next'

export default tseslint.config([
  eslint.configs.recommended,
  promisePlugin.configs['flat/recommended'],
  ...tanstackQueryPlugin.configs['flat/recommended'],
  {
    plugins: {
      '@next/next': nextPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      }
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: false,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      "no-alert": 0,
      "no-console": 0,
      "no-debugger": 1,
      "no-empty-function": [
        1,
        {
          "allow": [
            "arrowFunctions"
          ]
        }
      ],
      "no-lone-blocks": 1,
      "no-param-reassign": 0,
      "no-underscore-dangle": 0,
      "no-unexpected-multiline": 1,
      "no-unreachable": 1,
      "no-useless-escape": 0,
      "no-var": 1,
      "prefer-const": 1,
      "strict": 0,
      "jsx-a11y/anchor-is-valid": 1,
      "jsx-a11y/label-has-associated-control": 1,
      "no-unused-vars": "off",
      "promise/catch-or-return": [
        1,
        {
          "allowFinally": true
        }
      ],
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // Canonical hooks + React Compiler rules from the React team
      ...reactHooksPlugin.configs.recommended.rules,
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      eslintReact.configs['recommended-typescript'],
    ],
    ignores: ['**/*.js'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": 0,
      "@typescript-eslint/no-unused-vars": [
        1,
        {
          "args": "all",
          "caughtErrors": "none",
          "ignoreRestSiblings": true,
          "vars": "all",
          "argsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_"
        }
      ],
      "@typescript-eslint/no-unsafe-assignment": 0,
      "@typescript-eslint/no-unsafe-member-access": 0,
      "@typescript-eslint/restrict-template-expressions": 0,
      "@typescript-eslint/no-unsafe-call": 0,
      "@typescript-eslint/no-unsafe-return": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/no-unsafe-argument": 0,
      "@typescript-eslint/no-var-requires": 0,
      "@typescript-eslint/no-floating-promises": 0,
      "@typescript-eslint/no-require-imports": 0,
      "@typescript-eslint/no-base-to-string": 0,
      "@typescript-eslint/no-misused-promises": 0,
      "@typescript-eslint/triple-slash-reference": 0,
      "@eslint-react/unsupported-syntax": 0,
      "@eslint-react/dom-no-dangerously-set-innerhtml": 0,
      "@eslint-react/no-array-index-key": 0,
      // Hooks/compiler checks are owned by eslint-plugin-react-hooks (the
      // React team's canonical implementations), so disable @eslint-react's
      // ports of the same rules to avoid double-reporting.
      "@eslint-react/rules-of-hooks": 0,
      "@eslint-react/exhaustive-deps": 0,
      "@eslint-react/purity": 0,
      "@eslint-react/set-state-in-effect": 0,
      "@eslint-react/set-state-in-render": 0,
      "@eslint-react/static-components": 0,
      "@eslint-react/use-memo": 0,
      "@eslint-react/error-boundaries": 0,
    }
  },
  {
    ignores: ['package-lock.json', 'postcss.config.js', 'tailwind.config.js', 'node_modules', '.next', 'playwright-report', 'prisma/generated', '.netlify'],
  },
])
