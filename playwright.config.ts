import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'
import { STORAGE_STATE } from './tests/support/storage-state.ts'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // `list` keeps `npm run test:e2e` readable in a terminal; the HTML report is
  // still written for `npx playwright show-report`.
  reporter: process.env.CI
    ? [['list'], ['html']]
    : [['list'], ['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  // The dev server compiles routes on first visit, so the first test to touch a
  // route pays a Turbopack cold start. Generous enough to absorb that.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:4000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  projects: [
    // Signs in once and writes the session to disk for the projects below.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      // Public pages, visited logged out.
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /.*\.authed\.spec\.ts/,
    },
    {
      // Anything behind a login. `*.authed.spec.ts` files land here.
      name: 'chromium-authed',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      testMatch: /.*\.authed\.spec\.ts/,
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'next dev --turbopack -p 4000',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
