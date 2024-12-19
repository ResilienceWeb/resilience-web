import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query'
import promisePlugin from 'eslint-plugin-promise'
import reactPlugin from 'eslint-plugin-react'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default tseslint.config([
  js.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  promisePlugin.configs['flat/recommended'],
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...tanstackQueryPlugin.configs['flat/recommended'],
  ...compat.extends('plugin:react-hooks/recommended'),
  ...compat.config({ extends: ['next', 'next/core-web-vitals', 'next/typescript'] }),
  {
    plugins: {
      react: reactPlugin,
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
      "react-hooks/rules-of-hooks": 2,
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": 0,
      "strict": 0,
      "react/jsx-props-no-spreading": 0,
      "react/react-in-jsx-scope": 0,
      "react/prop-types": 0,
      "jsx-a11y/anchor-is-valid": 1,
      "jsx-a11y/label-has-associated-control": 1,
      "no-unused-vars": "off",
      "promise/catch-or-return": [
        1,
        {
          "allowFinally": true
        }
      ],
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
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
      "@typescript-eslint/no-misused-promises": 0
    }
  },
  {
    ignores: ['package-lock.json', 'eslint.config.js', 'node_modules', '.next', 'playwright-report'],
  },
])
