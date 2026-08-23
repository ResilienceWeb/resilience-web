import { expect, test as setup } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { prisma } from './support/db.ts'
import { STORAGE_STATE } from './support/storage-state.ts'

/**
 * Logs in once and saves the session for every other spec to reuse.
 *
 * The app authenticates with an emailed one-time passcode. Rather than driving
 * that through a mail server, this writes the OTP straight into the
 * `verifications` table — the same row Better Auth would have written — and
 * then posts it to the real sign-in endpoint. The cookie that comes back is a
 * genuine one, minted by Better Auth, so the only step being skipped is the
 * email round trip.
 */
setup('authenticate as the seeded web owner', async ({ request }) => {
  const email =
    process.env.RW_TEST_USER_EMAIL ?? 'ismail.diner+cambridge-owner@gmail.com'

  const user = await prisma.user.findUnique({ where: { email } })
  expect(
    user,
    `No seeded user for ${email}. Run \`npx prisma migrate reset\` first.`,
  ).not.toBeNull()

  // Better Auth stores sign-in codes as `<otp>:<attempts>` under this identifier.
  const otp = '123456'
  const identifier = `sign-in-otp-${email}`

  await prisma.verification.deleteMany({ where: { identifier } })
  await prisma.verification.create({
    data: {
      id: randomUUID(),
      identifier,
      value: `${otp}:0`,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  })

  const response = await request.post('/api/auth/sign-in/email-otp', {
    data: { email, otp },
    headers: { origin: 'http://localhost:4000' },
  })

  expect(
    response.ok(),
    `Sign-in failed (${response.status()}): ${await response.text()}`,
  ).toBe(true)

  await request.storageState({ path: STORAGE_STATE })
  await prisma.$disconnect()
})
