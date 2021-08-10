import axios from 'axios';
const sgMail = require('@sendgrid/mail');
import { REMOTE_URL } from '@helpers/config';
import { htmlTemplate, textTemplate } from '@helpers/emailTemplates';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function (req, res) {
	try {
		const { email, listing } = req.body;

		if (!email) {
			res.status(400);
			res.json({
				error: `Email not provided. Please make sure it's included in the request body.`,
			});
		}

		if (!listing) {
			res.status(400);
			res.json({
				error: `Listing not provided. Please make sure it's included in the request body.`,
			});
		}

		// TODO: replace with fetch
		const response = await axios({
			method: 'POST',
			url: `${REMOTE_URL}/api/permissions/create`,
			data: {
				email: email,
				listingId: parseInt(listing.id),
			},
		});

		const emailEncoded = encodeURIComponent(email);
		const callToActionButtonUrl = `${REMOTE_URL}/admin?activate=${emailEncoded}`;
		if (response.status === 201) {
			const msg = {
				to: email,
				from: `Cambridge Resilience Web <info@resilienceweb.org.uk>`,
				subject: `Your invite to Cambridge Resilience Web`,
				text: textTemplate({ url: callToActionButtonUrl, email }),
				html: htmlTemplate({
					url: callToActionButtonUrl,
					email,
					buttonText: 'Activate account',
					mainText: `You have been invited to manage the group <b>${listing.title}</b> on Cambridge Resilience Web, a digital mapping of organisations in Cambridge that are working to create a more resilient, more equitable and greener future for Cambridge and its residents.`,
					footerText: `If you're not sure why you received this invite or if you have any questions, please reply to this email.`,
				}),
			};

			(async () => {
				try {
					await sgMail.send(msg);

					res.status(200);
					res.json({
						res: 'Invite sent successfully',
					});
				} catch (error) {
					console.error(error);

					if (error.response) {
						console.error(error.response.body);
					}
				}
			})();
		}

		res.status(400);
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to invite user - ${e}`,
		});
	}
}

// export const config = {
// 	api: {
// 		bodyParser: true,
// 	},
// };
