import { vi } from 'vitest'

/**
 * Stubs for the outbound edges of the app. Integration tests exercise real
 * Postgres and real route handlers, but must never send an email, upload an
 * image, or talk to MailerLite.
 *
 * Import this from a setup file so the mocks are registered before any test
 * module is loaded. Individual tests can still assert on the stubs by
 * importing the same module and reading the mock.
 */

// `revalidatePath` needs Next's request store, which does not exist when a
// route handler is called directly from a test.
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
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
// with `signInAs()` / `signOut()` from `test/session.ts`.
vi.mock('@auth', async () => {
  const { sessionStore } = await import('../session.ts')
  return {
    auth: {},
    // eslint-disable-next-line @typescript-eslint/require-await -- must be a promise to match the real signature
    getSessionSafe: vi.fn(async () => sessionStore.current),
  }
})
