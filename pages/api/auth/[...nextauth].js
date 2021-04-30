import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import Adapters from 'next-auth/adapters';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default NextAuth({
	providers: [
		// Providers.Auth0({
		// 	clientId: process.env.AUTH0_ID,
		// 	clientSecret: process.env.AUTH0_SECRET,
		// 	domain: process.env.AUTH0_DOMAIN,
		// }),
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
	// session: {
	// 	jwt: true,
	// },

	// A database is optional, but required to persist accounts in a database
	// database: process.env.DATABASE_URL,
});
