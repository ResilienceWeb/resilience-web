import react from '@vitejs/plugin-react'
import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { resolveTestDatabaseUrl } from './test/db/testDatabaseUrl.ts'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const r = (p: string) => path.resolve(rootDir, p)

/**
 * Mirrors the `paths` in tsconfig.json.
 *
 * Declared as an ordered array rather than an object because a couple of the
 * aliases are prefixes of each other (`@auth` / `@auth-client`), and because
 * `@prisma/*` must only capture `@prisma/browser` — `@prisma/adapter-pg` is a
 * real npm package and has to keep resolving to node_modules.
 */
const alias = [
  { find: /^@prisma-rw-build$/, replacement: r('prisma/build-client.ts') },
  { find: /^@prisma-rw$/, replacement: r('prisma/client.ts') },
  { find: /^@prisma-client$/, replacement: r('prisma/generated/client.ts') },
  { find: /^@prisma\/browser$/, replacement: r('prisma/generated/browser.ts') },
  { find: /^@auth-client$/, replacement: r('lib/auth-client.ts') },
  { find: /^@auth$/, replacement: r('app/auth.ts') },
  { find: /^@components\//, replacement: `${r('components')}/` },
  { find: /^@hooks\//, replacement: `${r('hooks')}/` },
  { find: /^@helpers\//, replacement: `${r('helpers')}/` },
  { find: /^@db\//, replacement: `${r('db')}/` },
  { find: /^@store\//, replacement: `${r('store')}/` },
  { find: /^@styles\//, replacement: `${r('styles')}/` },
  { find: /^@trigger\//, replacement: `${r('trigger')}/` },
  { find: /^@\//, replacement: `${rootDir}/` },
]

/** Playwright owns `tests/` — Vitest must never try to collect those specs. */
const sharedExclude = [
  '**/node_modules/**',
  '**/.next/**',
  '**/prisma/generated/**',
  'tests/**',
]

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    globals: false,
    projects: [
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['{app,db,helpers,lib,trigger}/**/*.test.ts'],
          exclude: [...sharedExclude, '**/*.integration.test.ts'],
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'components',
          environment: 'jsdom',
          include: ['{app,components,hooks,store}/**/*.test.tsx'],
          exclude: sharedExclude,
          setupFiles: ['./test/setup/components.ts'],
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'integration',
          environment: 'node',
          include: ['{app,db,lib,helpers}/**/*.integration.test.ts'],
          exclude: sharedExclude,
          // Point every module — tests, repositories and route handlers alike —
          // at the test database before any of them import `@prisma-rw`.
          // `integration-global.ts` validates it before the workers start.
          env: { DATABASE_URL: resolveTestDatabaseUrl() ?? '' },
          globalSetup: ['./test/setup/integration-global.ts'],
          setupFiles: ['./test/setup/integration.ts'],
          // Every integration test shares one database, so they must not
          // interleave. One fork, one file at a time.
          pool: 'forks',
          fileParallelism: false,
          testTimeout: 30_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
})
