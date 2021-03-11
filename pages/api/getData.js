import { GoogleSpreadsheet } from 'google-spreadsheet';

const SPREADSHEET_ID = process.env.APP_SPREADSHEET_ID;
const SHEET_ID = process.env.APP_SHEET_ID;
const CLIENT_EMAIL = process.env.APP_GOOGLE_CLIENT_EMAIL;
const { privateKey: PRIVATE_KEY } = JSON.parse(
	process.env.APP_GOOGLE_SERVICE_PRIVATE_KEY,
);

export default async (req, res) => {
	const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

	console.log({ PRIVATE_KEY });

	try {
		await doc.useServiceAccountAuth({
			client_email: CLIENT_EMAIL,
			private_key: PRIVATE_KEY,
		});

		await doc.loadInfo();

		const sheet = doc.sheetsById[SHEET_ID];
		const rows = await sheet.getRows();

		const transformedRows = rows.map((row) => ({
			rowNumber: row._rowNumber,
			id: row.id,
			name: row.organization,
			category: row.category,
			description: row.description,
			website: row.website,
		}));

		res.status(200).json({ result: transformedRows });
	} catch (e) {
		res.status(400).json({ error: 'Something went wrong: ' + e });
		// eslint-disable-next-line no-console
		console.error('Error: ', e);
	}
};
