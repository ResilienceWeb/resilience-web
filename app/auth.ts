import * as Sentry from '@sentry/nextjs'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { magicLink, admin } from 'better-auth/plugins'
import nodemailer from 'nodemailer'
import prisma from '@prisma-rw'
import { simpleHtmlTemplate, textTemplate } from '@helpers/emailTemplates'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    admin(),
    magicLink({
      expiresIn: 60 * 60 * 24 * 7, // one week
      sendMagicLink: ({ email, url }) => {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_SERVER_HOST,
          port: Number(process.env.EMAIL_SERVER_PORT),
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        })

        transporter.sendMail(
          {
            to: email,
            from: process.env.EMAIL_FROM,
            subject: `Sign in to the Resilience Web`,
            text: textTemplate({ url }),
            html: simpleHtmlTemplate({
              url,
              email,
              mainText: '',
              buttonText: 'Sign in',
              footerText: `If you did not request this email you can safely ignore it.`,
            }),
          },
          (error) => {
            if (error) {
              console.error('[RW] SEND_VERIFICATION_EMAIL_ERROR', email, error)
              Sentry.captureException(error)
            }
          },
        )
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
