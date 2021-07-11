import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import Adapters from 'next-auth/adapters';
import prisma from '../../../prisma/client.js';

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
			from: process.env.EMAIL_FROM,
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
	},
	theme: 'light',
	pages: {
		signIn: '/auth/signin',
		verifyRequest: '/auth/verify-request',
	},
});
