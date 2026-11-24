export interface HomepageWeb {
  id: number
  title: string
  slug: string
  image: string | null
  publishedAt?: string | Date | null
  _count?: { listings: number }
  location?: {
    latitude: number | null
    longitude: number | null
    description?: string | null
  } | null
}

// Shared so the hero count reflects exactly the webs shown below it
export const isWebDisplayedOnHomepage = (web: HomepageWeb) => Boolean(web.image)

export const isNewWeb = (publishedAt: HomepageWeb['publishedAt']) => {
  if (!publishedAt) return false

  const fourMonthsAgo = new Date()
  fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4)

  return new Date(publishedAt) > fourMonthsAgo
}

export const hasMapLocation = (web: HomepageWeb) =>
  web.location?.latitude != null && web.location?.longitude != null

// Locations are stored as the geocoder's full address ("Ely, East
// Cambridgeshire, Cambridgeshire, …, England, United Kingdom"); show just the
// town and the nation
export const shortPlaceName = (description?: string | null) => {
  const parts = (description ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && part !== 'United Kingdom' && !/\d/.test(part))
  if (parts.length <= 1) return parts[0] ?? ''

  return `${parts[0]}, ${parts[parts.length - 1]}`
}
