import * as Sentry from '@sentry/nextjs'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { isAPIError } from 'better-auth/api'
import { betterAuth } from 'better-auth/minimal'
import { emailOTP, admin } from 'better-auth/plugins'
import prisma from '@prisma-rw'
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
      sendVerificationOTP: async ({ email, otp }) => {
        const otpEmail = OTPEmail({
          email,
          otp,
        })

        return sendEmail({
          to: email,
          subject: `Your Resilience Web verification code`,
          email: otpEmail,
        })
      },
    }),
  ],
  session: {
    modelName: 'Session',
    fields: {
      expiresAt: 'expires',
      token: 'sessionToken',
    },
  },
  account: {
    modelName: 'Account',
    fields: {
      accountId: 'providerAccountId',
      refreshToken: 'refresh_token',
      accessToken: 'access_token',
      accessTokenExpiresAt: 'access_token_expires',
      idToken: 'id_token',
    },
  },
  user: {
    modelName: 'User',
    deleteUser: {
      enabled: true,
    },
  },
  verification: {
    modelName: 'Verification',
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
