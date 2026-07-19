import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let listingPathItems: MetadataRoute.Sitemap = []
  let webPathItems: MetadataRoute.Sitemap = []

  try {
    const response = await fetch(
      `https://www.resilienceweb.org.uk/api/listings/for-sitemap`,
    )
    const data = await response.json()
    const { listings } = data
    listingPathItems = listings.map((l) => ({
      url: `https://${l.web.slug}.resilienceweb.org.uk/${l.slug}`,
      lastModified: l.updatedAt,
    }))
  } catch {
    // Degrade gracefully: keep the static entries even if listings can't be fetched.
  }

  try {
    const websResponse = await fetch(
      `https://www.resilienceweb.org.uk/api/webs/for-sitemap`,
    )
    const websData = await websResponse.json()
    const { webs } = websData
    webPathItems = webs.map((w) => ({
      url: `https://${w.slug}.resilienceweb.org.uk/web`,
      lastModified: w.updatedAt,
    }))
  } catch {
    // Degrade gracefully: keep the static entries even if webs can't be fetched.
  }

  return [
    {
      url: 'https://www.resilienceweb.org.uk',
    },
    {
      url: 'https://www.resilienceweb.org.uk/about',
    },
    {
      url: 'https://www.resilienceweb.org.uk/news',
    },
    ...webPathItems,
    ...listingPathItems,
  ]
}
