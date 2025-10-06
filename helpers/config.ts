export const REMOTE_URL = process.env.NEXT_PUBLIC_BASE_URL
export const REMOTE_HOSTNAME =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, '') || ''

export const PROTOCOL =
  process.env.NODE_ENV === 'development' ? 'http' : 'https'

const config = {
  digitalOceanSpaces: 'https://resilienceweb.ams3.digitaloceanspaces.com/',
  bucketName: 'resilienceweb',
}

export default config
