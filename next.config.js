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
		],
		formats: ['image/avif', 'image/webp'],
	},
	swcMinify: true,
};
