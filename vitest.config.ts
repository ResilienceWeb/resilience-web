import nextEnv from '@next/env'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { resolveTestDatabaseUrl } from './test/db/testDatabaseUrl.ts'
import { reactCompiler } from './test/vite/react-compiler.ts'

// Load .env the way Next does: plain dotenv leaves ${VAR} references in
// DATABASE_URL unexpanded, which Prisma rejects as an invalid port.
nextEnv.loadEnvConfig(process.cwd())

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
        // The app is built with the React Compiler (see next.config.js), so the
        // components are tested as it compiles them. Only the browser-side code
        // needs it — the email templates the other projects render are React
        // too, and the compiler's runtime has no dispatcher to hook into there.
        plugins: [reactCompiler()],
        test: {
          name: 'components',
          environment: 'jsdom',
          include: ['{app,components,hooks,store}/**/*.test.tsx'],
          setupFiles: ['./test/setup/components.tsx'],
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
