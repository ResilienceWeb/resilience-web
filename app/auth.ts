import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Sendgrid from 'next-auth/providers/sendgrid'
import nodemailer from 'nodemailer'
import prisma from '../prisma/client'
import { simpleHtmlTemplate, textTemplate } from '@helpers/emailTemplates'
import config from '@helpers/config'

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
      }
      return session
    },
    redirect({ baseUrl }) {
      return `${baseUrl}/admin`
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

// Use it in server contexts
// export function auth(
//   ...args:
//     | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
//     | [NextApiRequest, NextApiResponse]
//     | []
// ) {
//   return getServerSession(...args, authOptions)
// }
