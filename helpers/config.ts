export const REMOTE_URL =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://cambridgeresilienceweb.org.uk';

export default {
    digitalOceanSpaces: 'https://resilienceweb.ams3.digitaloceanspaces.com/',
    bucketName: 'resilienceweb',
    emailServer: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
    },
};

