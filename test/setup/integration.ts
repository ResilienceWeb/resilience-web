import { afterAll, beforeEach, vi } from 'vitest'
import prisma from '@prisma-rw'
import { resetDatabase } from '../db/reset.ts'
import { signOut } from '../session.ts'

/**
 * Everything that applies to every integration test.
 *
 * `DATABASE_URL` is already pointed at the test database by vitest.config.ts,
 * so the `@prisma-rw` singleton below is the exact same client the route
 * handlers and repositories use — tests and production code share a connection.
 */

/* -------------------------------------------------------------------------
 * Outbound edges
 *
 * These tests run real Postgres and real route handlers, but must never send
 * an email, upload an image, or call MailerLite. Tests can assert on the stubs
 * by importing the same module (e.g. `expect(sendEmail).toHaveBeenCalled()`).
 * ---------------------------------------------------------------------- */

// `revalidatePath` needs Next's request store, which does not exist when a
// route handler is called directly rather than served.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

// `after` needs that same request store. Only the scheduling is replaced —
// everything else in next/server, NextRequest included, stays real.
vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/server')>()),
  after: vi.fn(),
}))

// reCAPTCHA is an outbound call to Google. Tests drive the real routes and must
// not depend on the network or a configured key; the verifier's own behaviour
// is covered by its unit tests.
vi.mock('@/lib/verify-recaptcha', () => ({
  verifyRecaptcha: vi.fn().mockResolvedValue(true),
}))

vi.mock('@helpers/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
  sendMultipleEmails: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@helpers/uploadImage', () => ({
  default: vi.fn().mockResolvedValue(null),
}))

vi.mock('@helpers/deleteImage', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@helpers/syncSubscriberSegmentation', () => ({
  syncSubscriberSegmentation: vi.fn().mockResolvedValue(undefined),
  syncSubscriberSegmentationSafe: vi.fn().mockResolvedValue(undefined),
}))

// Mocked directly as well as through the wrapper above, so that a route
// importing MailerLite on its own can never reach the live API.
vi.mock('@helpers/mailerlite', () => ({
  upsertSubscriber: vi.fn().mockResolvedValue(undefined),
  getSubscriber: vi.fn().mockResolvedValue(null),
  getSubscriberId: vi.fn().mockResolvedValue(null),
  forgetSubscriber: vi.fn().mockResolvedValue(undefined),
  getOrCreateGroupId: vi.fn().mockResolvedValue('group-id'),
  unassignFromGroup: vi.fn().mockResolvedValue(undefined),
  SEGMENTATION_GROUPS: {},
}))

// Route handlers resolve the caller through `getSessionSafe`. Tests drive it
// with `signInAs()` / `signOut()` from `test/session.ts`. The store is imported
// inside the factory because `vi.mock` is hoisted above module scope.
vi.mock('@auth', async () => {
  const { sessionStore } = await import('../session.ts')
  return {
    auth: {},
    // eslint-disable-next-line @typescript-eslint/require-await -- must return a promise to match the real signature
    getSessionSafe: vi.fn(async () => sessionStore.current),
  }
})

/* ------------------------------------------------------------------------- */

beforeEach(async () => {
  await resetDatabase()
  signOut()
})

afterAll(async () => {
  await prisma.$disconnect()
})
