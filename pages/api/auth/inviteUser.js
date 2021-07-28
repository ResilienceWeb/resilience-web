import axios from 'axios';
import cookie from 'cookie';
import qs from 'qs';
import { REMOTE_URL } from '../../../helpers/config';

export default async function (req, res) {
	try {
		const CSRFResponse = await axios({
			method: 'GET',
			url: `${REMOTE_URL}/api/auth/csrf`,
		});

		const { email, listingId } = req.body;

		if (!email) {
			res.status(400);
			res.json({
				error: `Email not provided. Please make sure it's included in the request body.`,
			});
		}

		const response = await axios({
			method: 'POST',
			url: `${REMOTE_URL}/api/permissions/create`,
			data: {
				email: email,
				listingId: parseInt(listingId),
			},
		});

		if (response.status === 201) {
			const params = {
				email,
				callbackUrl: `${REMOTE_URL}`,
				csrfToken: String(CSRFResponse.data.csrfToken),
				json: 'true',
			};
			const data = qs.stringify(params);

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
				res: 'Invite sent successfully',
			});
		} else {
			res.status(400);
		}

		res.status(400);
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to invite user - ${e}`,
		});
	}
}

export const config = {
	api: {
		bodyParser: true,
	},
};
