import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { magicLink, admin } from 'better-auth/plugins'
import prisma from '@prisma-rw'
import { sendEmail } from '@helpers/email'
import SignInEmail from '@components/emails/SignInEmail'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    admin(),
    magicLink({
      expiresIn: 60 * 60 * 24 * 7, // one week
      sendMagicLink: ({ email, url }) => {
        const signInEmail = SignInEmail({
          url,
          email,
          mainText: '',
          buttonText: 'Sign in',
          footerText: `If you did not request this email you can safely ignore it.`,
        })

        return sendEmail({
          to: email,
          subject: `Sign in to the Resilience Web`,
          email: signInEmail,
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
  },
  verification: {
    modelName: 'Verification',
  },
})
