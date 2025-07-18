import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'
import Nodemailer from 'next-auth/providers/nodemailer'
import nodemailer from 'nodemailer'
import prisma from '@prisma-rw'
import { simpleHtmlTemplate, textTemplate } from '@helpers/emailTemplates'

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: `Resilience Web <${process.env.EMAIL_FROM}>`,
      maxAge: 604800, // 7 days
      sendVerificationRequest({ identifier: email, url, provider }) {
        return new Promise((resolve, reject) => {
          nodemailer.createTransport(provider.server).sendMail(
            {
              to: email,
              from: provider.from,
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
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        name: session.user.name,
        id: user.id,
        admin: user.admin,
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
