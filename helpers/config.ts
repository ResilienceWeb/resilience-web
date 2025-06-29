export const REMOTE_URL =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
    ? 'https://staging.resilienceweb.org.uk'
    : process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://resilienceweb.org.uk'

export const REMOTE_HOSTNAME =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
    ? 'staging.resilienceweb.org.uk'
    : process.env.NODE_ENV === 'development'
      ? 'localhost:3000'
      : 'resilienceweb.org.uk'

export const PROTOCOL =
  process.env.NODE_ENV === 'development' ? 'http' : 'https'

const config = {
  digitalOceanSpaces: 'https://resilienceweb.ams3.digitaloceanspaces.com/',
  bucketName: 'resilienceweb',
}

export default config
