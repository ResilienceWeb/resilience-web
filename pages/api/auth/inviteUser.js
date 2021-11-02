import sgMail from '@sendgrid/mail';
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

		const response = await fetch(`${REMOTE_URL}/api/permissions/create`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: email,
				listingId: parseInt(listing.id),
			}),
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
					secondaryText: `<p>There is lots of great work being done in Cambridge by the multitude of Cambridge-based groups working to make a positive difference in the areas of the environment and civil society. However, there wasn't a single place to go that showed all the organisations and how they are connected. These webs, in the first instance, are therefore a tool to help potential volunteers to discover organisations such as yours. Additionally, we want to facilitate collaboration and cross pollination across organisations where desired, and are looking into running events in the future that would enable this.</p>
					<p>We hope you are excited to be a part of the Cambridge Resilience Web, and that you will share it with members of your organisation!  If you have any questions about the web, or if you would rather not be included on it, please let me know by replying to this email.</p>
					<p>Please give this a go, and we would love to hear any feedback you have about the web itself, how it is to use, and how it could be most useful to your organization.</p>
					<p>The Cambridge Resilience Web is a collaboration between volunteers at Transition Cambridge, Cambridge Doughnut, and the Interdisciplinary Research Hub in Sustainability & Conservation at Wolfson College, Cambridge.</p>
					<p>If that sounds good, click the button below to activate your account. If it doesn’t, we would appreciate it if you could reply to this email and let us know why.</p>`,
					footerText: `<p>If you're not sure why you received this invite or if you have any questions, please reply to this email.</p>
					<p>The Cambridge Resilience Web Team x</p>`,
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
		} else {
			res.status(400);
			res.json({
				error: 'There was an unspecified error',
			});
		}
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to invite user - ${e}`,
		});
	}
}
