export const REMOTE_URL =
  process.env.VERCEL_ENV === 'preview'
    ? process.env.VERCEL_URL
    : process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://resilienceweb.org.uk'

export const REMOTE_HOSTNAME =
  process.env.VERCEL_ENV === 'preview'
    ? process.env.VERCEL_URL
    : process.env.NODE_ENV === 'development'
    ? 'localhost:3000'
    : 'resilienceweb.org.uk'

export const PROTOCOL =
  process.env.NODE_ENV === 'development' ? 'http' : 'https'

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
}
