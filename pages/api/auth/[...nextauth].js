import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
// import { TypeORMLegacyAdapter } from '@next-auth/typeorm-legacy-adapter';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import nodemailer from 'nodemailer';
import prisma from '../../../prisma/client.js';
import { simpleHtmlTemplate, textTemplate } from '@helpers/emailTemplates';
import config from '@helpers/config';

export default NextAuth({
	providers: [
		EmailProvider({
			server: config.emailServer,
			from: `Cambridge Resilience Web <${process.env.EMAIL_FROM}>`,
			async sendVerificationRequest({
				identifier: email,
				url,
				token,
				baseUrl,
				provider,
			}) {
				return new Promise((resolve, reject) => {
					const { server, from } = provider;
					nodemailer.createTransport(server).sendMail(
						{
							to: email,
							from: `Cambridge Resilience Web <${from}>`,
							subject: `Sign in to Cambridge Resilience Web`,
							text: textTemplate({ url, email }),
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
								// eslint-disable-next-line no-console
								console.error(
									'SEND_VERIFICATION_EMAIL_ERROR',
									email,
									error,
								);
								return reject(
									new Error(
										'SEND_VERIFICATION_EMAIL_ERROR',
										error,
									),
								);
							}
							return resolve();
						},
					);
				});
			},
		}),
	],
	adapter: PrismaAdapter({
		...prisma,
		verificationRequest: 'VerificationToken',
	}),
	database: process.env.DATABASE_URL,
	sesion: {
		strategy: 'database',
		maxAge: 72 * 60 * 60,
		updateAge: 24 * 60 * 60,
	},
	callbacks: {
		async session({ session, token, user }) {
			session.user.id = user.id;
			session.user.admin = user.admin;
			return session;
		},
		async redirect({ baseUrl }) {
			return `${baseUrl}/admin`;
		},
	},
	theme: {
		colorScheme: 'light',
	},
	pages: {
		signIn: '/auth/signin',
		verifyRequest: '/auth/verify-request',
	},
	debug: true,
	secret: 'LlKq6ZtYbr+hTC073mAmAh9/h2HwMfsFo4hrfCx5mLg=', // TODO: replace with proper secret from env var
});
