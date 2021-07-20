import axios from 'axios';
import cookie from 'cookie';
import qs from 'qs';

export default async function (req, res) {
	let REMOTE_URL = '';
	if (process.env.NODE_ENV === 'development') {
		REMOTE_URL = 'http://localhost:3000';
	} else {
		REMOTE_URL = 'https://cambridgeresilienceweb.org.uk';
	}

	try {
		const CSRFResponse = await axios({
			method: 'GET',
			url: `${REMOTE_URL}/api/auth/csrf`,
		});

		console.log('body', req.body);

		const { email } = req.body;

		if (!email) {
			res.status(400);
			res.json({
				error: `Email not provided. Please make sure it's included in the request body.`,
			});
		}

		const params = {
			email,
			callbackUrl: REMOTE_URL,
			csrfToken: String(CSRFResponse.data.csrfToken),
			json: 'true',
		};
		const data = qs.stringify(params);

		// pase the cookie before sending
		const parsedCookie = cookie.parse(
			CSRFResponse.headers['set-cookie'].join('; '),
		);
		delete parsedCookie.Path;
		delete parsedCookie.SameSite;
		const Cookie = Object.entries(parsedCookie)
			.map(([key, val]) => cookie.serialize(key, val))
			.join('; ');

		const { status } = await axios({
			method: 'POST',
			url: `${REMOTE_URL}/api/auth/signin/email`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Cookie,
			},
			data,
		});

		res.status(status);
		res.json({
			user: req.body, // TBD
		});
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to invite user - ${e}`,
		});
	}
}