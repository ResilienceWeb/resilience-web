import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { Client } from 'pg'
import {
  adminDatabaseUrl,
  assertSafeTestDatabase,
  databaseNameOf,
  resolveTestDatabaseUrl,
} from '../db/testDatabaseUrl.ts'

const run = promisify(execFile)

/**
 * Runs once per `vitest --project integration` invocation, before any worker
 * starts: creates the test database if it is missing and brings its schema up
 * to date. Individual tests get a clean slate from the per-test truncate in
 * `integration.ts`, so this only has to happen once.
 */
export async function setup() {
  const testUrl = resolveTestDatabaseUrl()
  assertSafeTestDatabase(testUrl)

  const name = databaseNameOf(testUrl)
  const admin = new Client({ connectionString: adminDatabaseUrl(testUrl) })

  try {
    await admin.connect()
  } catch (error) {
    throw new Error(
      `Could not connect to Postgres to create the "${name}" test database. ` +
        'Is `npm run db:up` running?',
      { cause: error },
    )
  }

  try {
    const { rowCount } = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [name],
    )
    if (rowCount === 0) {
      // Identifier can't be parameterised; it is validated by assertSafeTestDatabase.
      await admin.query(`CREATE DATABASE "${name}"`)
    }
  } finally {
    await admin.end()
  }

  await run('npx', ['prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: testUrl },
    cwd: process.cwd(),
  })
}
