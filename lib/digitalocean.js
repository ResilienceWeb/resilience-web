import aws from 'aws-sdk';
// TODO: can use 'aws-sdk/clients/s3'

/**
 * Digital Ocean Spaces Connection
 */
const spacesEndpoint = new aws.Endpoint('ams3.digitaloceanspaces.com');
const credentials = new aws.Credentials({
	accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
});
const s3 = new aws.S3({
	endpoint: spacesEndpoint,
	credentials,
});

export default s3;
