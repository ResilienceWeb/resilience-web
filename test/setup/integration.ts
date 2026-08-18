import { afterAll, beforeEach } from 'vitest'
import prisma from '@prisma-rw'
import { resetDatabase } from '../db/reset.ts'
import { signOut } from '../session.ts'
import './external-mocks.ts'

/**
 * `DATABASE_URL` is already pointed at the test database by vitest.config.ts,
 * so the `@prisma-rw` singleton imported here is the exact same client the
 * route handlers and repositories use. Tests and production code therefore
 * read and write the same connection.
 */
beforeEach(async () => {
  await resetDatabase()
  signOut()
})

afterAll(async () => {
  await prisma.$disconnect()
})
