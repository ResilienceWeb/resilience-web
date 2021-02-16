import axios from 'axios';

axios.get('/api/getData').then((data) => {
	console.log(data);
});
