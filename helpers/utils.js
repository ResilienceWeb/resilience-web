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
