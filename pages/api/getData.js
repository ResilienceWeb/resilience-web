import { GoogleSpreadsheet } from 'google-spreadsheet';

const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;
const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const CLIENT_EMAIL = process.env.REACT_APP_GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.REACT_APP_GOOGLE_SERVICE_PRIVATE_KEY;

export default async (req, res) => {
	const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

	try {
		await doc.useServiceAccountAuth({
			client_email: CLIENT_EMAIL,
			private_key: PRIVATE_KEY,
		});

		await doc.loadInfo();
		const sheet = doc.sheetsById[SHEET_ID];
		const rows = await sheet.getRows();

		const data = rows
			.filter((row) => row.Name && row.Name.length > 0)
			.map((row) => ({
				rowNumber: row._rowNumber,
				id: row.id,
				name: row.organization,
				category: row.category,
				description: row.description,
				// phone: row.Phone,
				// address: row.Address,
				// plusCode: row.PlusCode,
				// allergies: row['Allergies?'],
				// deliveries: {
				// 	Tuesday: row.Tue,
				// 	Thursday: row.Thur,
				// 	Sunday: row.Sun,
				// },
				// notes: row.Notes,
				// optimalRoute: parseInt(row['optimal route']),
			}));

		res.status(200).json({ rows: data });
	} catch (e) {
		res.status(404).json({ error: 'Something went wrong' });
		// eslint-disable-next-line no-console
		console.error('Error: ', e);
	}
};
