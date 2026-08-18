import react from '@vitejs/plugin-react'
import 'dotenv/config'
import { defineConfig } from 'vitest/config'
import { resolveTestDatabaseUrl } from './test/db/testDatabaseUrl.ts'

export default defineConfig({
  plugins: [react()],
  // Reuse the `paths` in tsconfig.json rather than restating them here.
  resolve: { tsconfigPaths: true },
  test: {
    globals: false,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['{app,db,helpers,lib,trigger}/**/*.test.ts'],
          // `*.integration.test.ts` also matches `*.test.ts`, so the integration
          // files have to be handed back to their own project explicitly.
          exclude: ['**/*.integration.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'components',
          environment: 'jsdom',
          include: ['{app,components,hooks,store}/**/*.test.tsx'],
          setupFiles: ['./test/setup/components.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          environment: 'node',
          include: ['{app,db,lib,helpers}/**/*.integration.test.ts'],
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
