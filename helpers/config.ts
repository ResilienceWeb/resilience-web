export const REMOTE_URL = process.env.NEXT_PUBLIC_BASE_URL
export const REMOTE_HOSTNAME =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, '').replace(
    'www.',
    '',
  ) || ''

export const PROTOCOL =
  process.env.NODE_ENV === 'development' ? 'http' : 'https'

export function isBranchDeploy(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.location.hostname.endsWith('--resilienceweb.netlify.app')
  )
}

export function getWebUrl(slug: string): string {
  if (isBranchDeploy()) {
    return `/${slug}`
  }
  return `${PROTOCOL}://${slug}.${REMOTE_HOSTNAME}`
}

const config = {
  supabaseStorageUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resilienceweb/`,
  bucketName: 'resilienceweb',
}

export default config
