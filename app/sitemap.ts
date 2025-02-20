import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const response = await fetch(
    `https://resilienceweb.org.uk/api/listings/for-sitemap`,
  )
  const data = await response.json()
  const { listings } = data
  const pathItems = listings.map((l) => ({
    url: `https://${l.web.slug}.resilienceweb.org.uk/${l.slug}`,
    lastModified: l.updatedAt,
  }))

  return [
    {
      url: 'https://resilienceweb.org.uk',
    },
    {
      url: 'https://resilienceweb.org.uk/about',
    },
    {
      url: 'https://resilienceweb.org.uk/news',
    },
    ...pathItems,
  ]
}
