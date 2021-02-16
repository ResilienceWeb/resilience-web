/* eslint-disable no-console */
import axios from 'axios';

const APP_URL = 'https://cambridgeresilienceweb.vercel.app';

const refetchData = async () => {
	try {
		return await axios.get(`${APP_URL}/api/getData`);
	} catch (e) {
		console.error(e);
	}
};

refetchData().then((data) => {
	console.log(data);
});
