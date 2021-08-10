import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import Adapters from 'next-auth/adapters';
import nodemailer from 'nodemailer';
import prisma from '../../../prisma/client.js';
import { htmlTemplate, textTemplate } from '@helpers/emailTemplates';

export default NextAuth({
	providers: [
		Providers.Email({
			server: {
				host: process.env.EMAIL_SERVER_HOST,
				port: process.env.EMAIL_SERVER_PORT,
				auth: {
					user: process.env.EMAIL_SERVER_USER,
					pass: process.env.EMAIL_SERVER_PASSWORD,
				},
			},
			maxAge: 72 * 60 * 60,
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
							html: htmlTemplate({
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
	adapter: Adapters.Prisma.Adapter({ prisma }),
	database: process.env.DATABASE_URL,
	callbacks: {
		async session(session, token) {
			session.user.id = token.id;
			session.user.admin = token.admin;
			return session;
		},
		async redirect(url, baseUrl) {
			return `${baseUrl}/admin`;
		},
	},
	theme: 'light',
	pages: {
		signIn: '/auth/signin',
		verifyRequest: '/auth/verify-request',
	},
	debug: false,
});
