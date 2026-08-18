/**
 * Resolves (and sanity-checks) the connection string used by integration tests.
 *
 * Integration tests truncate every table between test cases, so pointing them
 * at the wrong database would be destructive. Everything here exists to make
 * that impossible by accident.
 */

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0'])

export const TEST_DATABASE_NAME = 'resilience_web_test'

/**
 * Derives the test database URL from `TEST_DATABASE_URL`, falling back to
 * `DATABASE_URL` with the database name swapped for `resilience_web_test`.
 */
export function resolveTestDatabaseUrl(): string | null {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL

  const base = process.env.DATABASE_URL
  if (!base) return null

  try {
    const url = new URL(base)
    url.pathname = `/${TEST_DATABASE_NAME}`
    return url.toString()
  } catch {
    return null
  }
}

/** The `postgres` maintenance database on the same server, used to CREATE DATABASE. */
export function adminDatabaseUrl(testUrl: string): string {
  const url = new URL(testUrl)
  url.pathname = '/postgres'
  return url.toString()
}

export function databaseNameOf(testUrl: string): string {
  return new URL(testUrl).pathname.replace(/^\//, '')
}

/**
 * Throws unless the target is unmistakably a local, disposable test database.
 *
 * Set `ALLOW_REMOTE_TEST_DATABASE=1` to opt out — only ever do this for a
 * database you are happy to see truncated.
 */
export function assertSafeTestDatabase(
  testUrl: string | null,
): asserts testUrl is string {
  if (!testUrl) {
    throw new Error(
      'No test database configured. Set DATABASE_URL (or TEST_DATABASE_URL) in .env, ' +
        'and make sure `npm run db:up` is running.',
    )
  }

  const url = new URL(testUrl)
  const name = databaseNameOf(testUrl)

  if (!name.endsWith('_test')) {
    throw new Error(
      `Refusing to run integration tests against database "${name}": the name must end in "_test".`,
    )
  }

  if (process.env.ALLOW_REMOTE_TEST_DATABASE === '1') return

  if (!LOCAL_HOSTNAMES.has(url.hostname)) {
    throw new Error(
      `Refusing to run integration tests against non-local host "${url.hostname}". ` +
        'Check that DATABASE_URL in .env points at your local Docker Postgres. ' +
        'Set ALLOW_REMOTE_TEST_DATABASE=1 only if you are certain.',
    )
  }
}
