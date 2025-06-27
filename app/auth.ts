import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'
import Sendgrid from 'next-auth/providers/sendgrid'
import nodemailer from 'nodemailer'
import prisma from '@prisma-rw'
import config from '@helpers/config'
import { simpleHtmlTemplate, textTemplate } from '@helpers/emailTemplates'

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Sendgrid({
      id: 'email',
      // @ts-ignore
      server: config.emailServer,
      from: `Resilience Web <${process.env.EMAIL_FROM}>`,
      maxAge: 604800, // 7 days
      async sendVerificationRequest({ identifier: email, url, provider }) {
        return new Promise((resolve, reject) => {
          const { server, from } = provider
          nodemailer.createTransport(server).sendMail(
            {
              to: email,
              from,
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
                console.error(
                  '[RW] SEND_VERIFICATION_EMAIL_ERROR',
                  email,
                  error,
                )
                return reject(
                  new Error(`SEND_VERIFICATION_EMAIL_ERROR ${error}`),
                )
              }
              return resolve()
            },
          )
        })
      },
    }),
  ],
  // @ts-ignore
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',
    maxAge: 720 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    session({ session, user }) {
      session.user = {
        ...session.user,
        id: user.id,
        admin: user.admin,
        ownerships: user.ownerships,
      }
      return session
    },
  },
  theme: {
    colorScheme: 'light',
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  debug: false,
})
