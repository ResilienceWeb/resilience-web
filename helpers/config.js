export const REMOTE_URL =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:3000'
		: 'https://cambridgeresilienceweb.org.uk';

export default {
	digitalOceanSpaces: 'https://resilienceweb.ams3.digitaloceanspaces.com/',
	bucketName: 'resilienceweb',
};
