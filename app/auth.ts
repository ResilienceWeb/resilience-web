import * as Sentry from '@sentry/nextjs'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { isAPIError } from 'better-auth/api'
import { betterAuth } from 'better-auth/minimal'
import { emailOTP, admin } from 'better-auth/plugins'
import prisma from '@prisma-rw'
import { onAccountEmailChanged } from '@helpers/accountEmailChanged'
import { sendEmail } from '@helpers/email'
import OTPEmail from '@components/emails/OTPEmail'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: ['http://localhost:4000', 'http://*.localhost:4000'],
  advanced: {
    ipAddress: {
      // Set by Netlify's proxy from the real client connection; the default
      // x-forwarded-for arrives as a multi-IP chain, which Better Auth
      // rejects as untrusted unless trustedProxies is configured
      ipAddressHeaders: ['x-nf-client-connection-ip'],
    },
  },
  logger: {
    level: 'warn',
    log: (level, message, ...args) => {
      if (level === 'error') {
        // Better Auth passes the underlying error as an arg; capture it
        // directly so Sentry gets its real stack trace, not just the
        // generic message (e.g. "INTERNAL_SERVER_ERROR")
        const underlyingError = args.find((arg) => arg instanceof Error)
        Sentry.captureException(
          underlyingError ?? new Error(`[better-auth] ${message}`),
          {
            extra: { betterAuthMessage: message, args },
          },
        )
      } else if (level === 'warn') {
        Sentry.captureMessage(`[better-auth] ${message}`, {
          level: 'warning',
          extra: { args },
        })
      }
    },
  },
  onAPIError: {
    onError: (error, _ctx) => {
      Sentry.captureException(error)
    },
  },
  plugins: [
    admin(),
    emailOTP({
      expiresIn: 60 * 10, // 10 minutes
      // Only the new address is verified. The usual reason to change is having
      // lost the old one, so the old address is told about the change instead.
      changeEmail: {
        enabled: true,
      },
      sendVerificationOTP: async ({ email, otp, type }) => {
        const purpose = type === 'change-email' ? 'change-email' : 'sign-in'
        const otpEmail = OTPEmail({
          email,
          otp,
          purpose,
        })

        return sendEmail({
          to: email,
          subject:
            purpose === 'change-email'
              ? `Confirm your new Resilience Web email address`
              : `Your Resilience Web verification code`,
          email: otpEmail,
        })
      },
    }),
  ],
  // `modelName` is the property Prisma exposes on the client (`prisma.session`),
  // not the name of the model in schema.prisma. The two only differ in the
  // first letter, and Prisma's client answers to either, so the capitalised
  // names these used to carry worked at runtime — until Better Auth 1.7 began
  // validating the schema and reported every one of these tables as missing.
  // The defaults are already correct, so only genuine renames are listed.
  session: {
    fields: {
      expiresAt: 'expires',
      token: 'sessionToken',
    },
  },
  account: {
    fields: {
      accountId: 'providerAccountId',
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  databaseHooks: {
    user: {
      update: {
        // The endpoint's session still holds the user as they were before the
        // update, which is the only place the previous address survives.
        after: async (user, ctx) => {
          if (ctx?.path !== '/email-otp/change-email') return
          const previousEmail = ctx.context.session?.user.email
          if (!previousEmail || previousEmail === user.email) return

          await onAccountEmailChanged({
            previousEmail,
            newEmail: user.email,
            name: user.name,
          })
        },
      },
    },
  },
})

/**
 * Like auth.api.getSession, but returns null instead of throwing when the
 * session becomes invalid mid-request (Better Auth throws an UNAUTHORIZED
 * APIError if the session row is deleted between its read and its rolling
 * refresh, e.g. by a concurrent sign-out).
 */
export async function getSessionSafe(headers: Headers) {
  try {
    return await auth.api.getSession({ headers })
  } catch (error) {
    if (isAPIError(error) && error.statusCode === 401) {
      return null
    }
    throw error
  }
}
