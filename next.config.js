module.exports = {
	webpack(config) {
		config.resolve.modules.push(__dirname);
		return config;
	},
	images: {
		domains: [
			'media.graphcms.com',
			'via.placeholder.com',
			'resilienceweb.ams3.digitaloceanspaces.com',
			'opencollective.com',
		],
		formats: ['image/avif', 'image/webp'],
	},
	env: {
		TINY_APIKEY: process.env.TINY_MCE_APIKEY,
	},
	swcMinify: true,
};
