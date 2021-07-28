import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import Adapters from 'next-auth/adapters';
import nodemailer from 'nodemailer';
import prisma from '../../../prisma/client.js';
import { REMOTE_URL } from '../../../helpers/config';

async function fetchPermissions(email) {
	const emailEncoded = encodeURIComponent(email);
	const response = await fetch(
		`${REMOTE_URL}/api/permissions?email=${emailEncoded}`,
	);
	const data = await response.json();
	const { editPermissions } = data;
	return editPermissions;
}

async function fetchUserByEmail(email) {
	try {
		const emailEncoded = encodeURIComponent(email);
		const response = await fetch(`${REMOTE_URL}/api/users/${emailEncoded}`);
		const data = await response.json();
		const { user } = data;
		return user;
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error('Error', e);
	}
}

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
			from: `Cambridge Resilience Web <${process.env.EMAIL_FROM}>`,
			async sendVerificationRequest({
				identifier: email,
				url,
				token,
				baseUrl,
				provider,
			}) {
				const userInfo = await fetchUserByEmail(email);

				if (userInfo) {
					// User exists - sign in as usual

					return new Promise((resolve, reject) => {
						const { server, from } = provider;
						nodemailer.createTransport(server).sendMail(
							{
								to: email,
								from: `Cambridge Resilience Web <${from}>`,
								subject: `Sign in to Cambridge Resilience Web`,
								text: text({ url, email }),
								html: html({
									url,
									email,
									mainText: '',
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
				} else {
					// User is not registered, so going for invitation workflow
					const permissions = await fetchPermissions(email);

					if (permissions?.length === 0) {
						// TODO: implement NextAuth error page (e.g. you need to be invited to access dashboard etc)

						return new Promise((_, reject) =>
							reject('User not registered and not invited'),
						);
					}

					const permission = permissions.reduce(
						(accumulator, current) =>
							Date.parse(accumulator.createdAt) >=
							Date.parse(current.createdAt)
								? accumulator
								: current,
					);

					return new Promise((resolve, reject) => {
						const { server, from } = provider;

						nodemailer.createTransport(server).sendMail(
							{
								to: email,
								from: `Cambridge Resilience Web <${from}>`,
								subject: `Your invite to Cambridge Resilience Web`,
								text: text({ url, email }),
								html: html({
									url,
									email,
									mainText: `You have been invited to manage ${permission.listing.title} on Cambridge Resilience Web, a digital mapping of organisations in Cambridge that are working to create a more resilient, more equitable and greener future for Cambridge and its residents.`,
									footerText: `If you're not sure why you received this invite or if you have any questions, please reply to this email.`,
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
				}
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
	debug: true,
});

const html = ({ url, email, mainText, footerText }) => {
	// Insert invisible space into domains and email address to prevent both the
	// email address and the domain from being turned into a hyperlink by email
	// clients like Outlook and Apple mail, as this is confusing because it seems
	// like they are supposed to click on their email address to sign in.
	const escapedEmail = `${email.replace(/\./g, '&#8203;.')}`;
	// const escapedSite = `${'Cambridge Re'.replace(/\./g, '&#8203;.')}`;

	const backgroundColor = '#f9f9f9';
	const textColor = '#444444';
	const mainBackgroundColor = '#ffffff';
	const buttonBackgroundColor = '#57b894';
	const buttonBorderColor = '#57b894';
	const buttonTextColor = '#ffffff';

	// Uses tables for layout and inline CSS due to email client limitations
	return `
  <body style="background: ${backgroundColor}; margin-bottom: 16px;">
	<table width="100%" border="0" cellspacing="0" cellpadding="0">
	  <tr>
		<td align="center" style="padding: 10px 0px 20px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
		  <strong>Cambridge Resilience Web</strong>
		</td>
	  </tr>
	</table>
	<table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
	<tr align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
		${mainText}
	</tr>
	  <tr>
		<td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
		  Click the button below to sign in as <strong>${escapedEmail}</strong>
		</td>
	  </tr>
	  <tr>
		<td align="center" style="padding: 20px 0;">
		  <table border="0" cellspacing="0" cellpadding="0">
			<tr>
			  <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; text-decoration: none;border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">Sign in</a></td>
			</tr>
		  </table>
		</td>
	  </tr>
	  <tr>
		<td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
		  ${footerText}
		</td>
	  </tr>
	</table>
  </body>
  `;
};

// Email text body – fallback for email clients that don't render HTML
const text = ({ url }) => `Sign in to Cambridge Resilience Web\n${url}\n\n`;
