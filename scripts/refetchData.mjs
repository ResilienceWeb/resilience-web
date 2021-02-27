/* eslint-disable no-console */
import axios from 'axios';
import fs from 'fs';

const APP_URL = 'https://cambridgeresilienceweb.org.uk';

const refetchData = async () => {
	try {
		return await axios.get(`${APP_URL}/api/getData`);
	} catch (e) {
		console.error(e);
	}
};

refetchData().then((response) => {
	const stringData = JSON.stringify(response.data.result);
	fs.writeFile('./scripts/imported-data.json', stringData, (err) => {
		if (!err) {
			console.log('DONE');
		} else {
			console.error(err);
		}
	});
});
