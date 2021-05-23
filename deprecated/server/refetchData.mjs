/* eslint-disable no-console */
import axios from 'axios';
import fs from 'fs';

const APP_URL = 'http://localhost:3001';

// Note: for this to run, you first need to start the local server with 'npm run start'
const refetchData = async () => {
	try {
		return await axios.get(`${APP_URL}/getData`);
	} catch (e) {
		console.error(e);
	}
};

refetchData().then((response) => {
	const stringData = JSON.stringify(response.data.result);
	fs.writeFile('./data/imported-data.json', stringData, (err) => {
		if (!err) {
			console.log('Data fetched successfully');
		} else {
			console.error(err);
		}
	});
});
