/**
 * Resolves (and sanity-checks) the connection string used by integration tests.
 *
 * These tests truncate every table between test cases, so pointing them at the
 * wrong database would destroy real data. The checks below exist to make that
 * impossible by accident.
 */

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0'])

/**
 * `TEST_DATABASE_URL` if set, otherwise `DATABASE_URL` with the database name
 * swapped for `resilience_web_test`.
 */
export function resolveTestDatabaseUrl(): string | null {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL
  if (!process.env.DATABASE_URL) return null

  try {
    const url = new URL(process.env.DATABASE_URL)
    url.pathname = '/resilience_web_test'
    return url.toString()
  } catch {
    return null
  }
}

/** The `postgres` maintenance database on the same server, for CREATE DATABASE. */
export function adminDatabaseUrl(testUrl: string): string {
  const url = new URL(testUrl)
  url.pathname = '/postgres'
  return url.toString()
}

/**
 * Throws unless the target is unmistakably a local, disposable test database,
 * and narrows away the `null` so callers can use the URL directly.
 */
export function assertSafeTestDatabase(
  testUrl: string | null,
): asserts testUrl is string {
  if (!testUrl) {
    throw new Error(
      'No test database configured. Set DATABASE_URL in .env and make sure ' +
        '`npm run db:up` is running.',
    )
  }

  const { hostname, pathname } = new URL(testUrl)
  const name = pathname.replace(/^\//, '')

  if (!name.endsWith('_test')) {
    throw new Error(
      `Refusing to run integration tests against database "${name}": ` +
        'the name must end in "_test".',
    )
  }

  if (!LOCAL_HOSTNAMES.has(hostname)) {
    throw new Error(
      `Refusing to run integration tests against non-local host "${hostname}". ` +
        'Check that DATABASE_URL in .env points at your local Docker Postgres.',
    )
  }
}

/** The database name in a connection string, e.g. for CREATE DATABASE. */
export function databaseNameOf(testUrl: string): string {
  return new URL(testUrl).pathname.replace(/^\//, '')
}
