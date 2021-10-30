export const sortStringsFunc = (a, b) => {
	const labelA = a.title?.toLowerCase();
	const labelB = b.title?.toLowerCase();

	if (labelA < labelB) {
		return -1;
	}
	if (labelA > labelB) {
		return 1;
	}

	return 0;
};

export const stringToBoolean = function (value) {
	if (value === 'true') return true;

	if (value === 'false') return false;

	throw 'Invalid input. This function only takes "true" or "false" and converts them to primitive boolean.';
};

export const sanitizeLink = (link) => {
	let result = link;
	result = result.replace('https://www.', '');
	result = result.replace('https://', '');
	result = result.replace(/\/$/, '');

	return result;
};
