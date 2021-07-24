const emailRegex = new RegExp(/\S+@\S+\.\S+/);

export const emailValidator = (value) => {
	if (value === '') return false;
	return emailRegex.test(value) ? '' : 'Please enter a valid email.';
};

export const emailRequiredValidator = (value) => {
	if (!value || value === '') return 'Email is required';
	return emailRegex.test(value) ? '' : 'Please enter a valid email.';
};
