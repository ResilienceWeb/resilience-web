import * as Sentry from '@sentry/nextjs'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { betterAuth } from 'better-auth/minimal'
import { emailOTP, admin } from 'better-auth/plugins'
import prisma from '@prisma-rw'
import { sendEmail } from '@helpers/email'
import OTPEmail from '@components/emails/OTPEmail'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  logger: {
    level: 'warn',
    log: (level, message, ...args) => {
      if (level === 'error' || level === 'warn') {
        Sentry.captureException({ level, message, args })
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
