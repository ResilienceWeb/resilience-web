import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

export default NextAuth({
	providers: [
		Providers.Auth0({
			clientId: process.env.AUTH0_ID,
			clientSecret: process.env.AUTH0_SECRET,
			domain: process.env.AUTH0_DOMAIN,
		}),
	],

	// A database is optional, but required to persist accounts in a database
	// database: process.env.DATABASE_URL,
});
