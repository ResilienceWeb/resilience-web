import type { Metadata } from 'next'
import truncate from 'lodash.truncate'
import { generateSlug } from '@helpers/utils'
import Listing from '../../[subdomain]/[slug]/Listing'
import { CATEGORY_COLOR_MAPPING, TAG_COLOR_MAPPING } from '../utils'

export default async function TransitionListingPage(props) {
  const params = await props.params
  const listing = await getListing({
    listingSlug: params.slug,
  })

  if (!listing) {
    console.log(`[RW] Listing not found for slug ${params.slug}`)
    return null
  }

  return <Listing listing={listing} />
}

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params
  const listing = await getListing({
    listingSlug: params.slug,
  })

  if (!listing) {
    return null
  }

  const descriptionStrippedOfHtml = listing.description?.replace(
    /<[^>]*>?/gm,
    '',
  )
  const truncatedDescription = truncate(descriptionStrippedOfHtml, {
    length: 160,
    separator: /,.? +/,
  })

  return {
    title: `${listing.title} | Resilience Web`,
    openGraph: {
      title: `${listing.title} | Resilience Web`,
      description: truncatedDescription,
      images: [{ url: listing.image }],
    },
  }
}

export async function generateStaticParams() {
  const url =
    'https://maps.transitionnetwork.org/wp-json/cds/v1/initiatives?country=GB&per_page=10000'

  try {
    const response = await fetch(url, { cache: 'force-cache' })
    if (!response.ok) throw new Error(`Upstream responded ${response.status}`)
    const { body: listings } = await response.json()

    return listings.map((l) => ({
      slug: generateSlug(l.title),
    }))
  } catch (err) {
    console.error('[RW] Transition generateStaticParams fetch failed', err)

    // Return empty array to prevent build failure
    // This means no static paths will be generated, but pages can still be rendered on-demand
    return []
  }
}

async function getListing({ listingSlug }): Promise<any> {
  const url =
    'https://maps.transitionnetwork.org/wp-json/cds/v1/initiatives?country=GB&per_page=10000'

  try {
    // Primary: serve from cache and revalidate in background
    // If upstream fails during revalidation, previous cached data is kept
    const response = await fetch(url, {
      next: { revalidate: 86400, tags: ['transition-data'] },
    })
    if (!response.ok) throw new Error(`Upstream responded ${response.status}`)
    const { body: data } = await response.json()
    return transformAndFindListing(data, listingSlug)
  } catch (err) {
    console.error(
      '[RW] Transition getListing fetch failed, attempting cached fallback',
      err,
    )

    // Fallback: try to serve any existing cached payload
    try {
      const cachedResponse = await fetch(url, { cache: 'force-cache' })
      if (cachedResponse.ok) {
        const { body: cached } = await cachedResponse.json()
        return transformAndFindListing(cached, listingSlug)
      }
    } catch (_) {
      // Ignore cache errors and return null
    }

    // Final fallback: return null to prevent build failure
    console.log(`[RW] All fallbacks failed for listing slug ${listingSlug}`)
    return null
  }
}

function transformAndFindListing(data: any[], listingSlug: string) {
  const cleanedData = data.map((item) => {
    const categoryLabel = item.countries
      .replace(/&amp;/g, '&')
      .replace(' | United Kingdom', '')
      .replace('United Kingdom | ', '')

    const itemTags = []
    item.tags?.forEach((tagLabel) => {
      const tagId = itemTags.length + 1
      itemTags.push({
        id: tagId,
        label: tagLabel,
        color: TAG_COLOR_MAPPING[tagLabel],
      })
    })

    return {
      id: item.id,
      title: item.title,
      slug: generateSlug(item.title),
      description: item.description,
      website: item.url, // or item.contact.website?
      image: item.logo,
      facebook: item.contact.facebook,
      instagram: item.contact.instagram,
      twitter: item.contact.twitter,
      category: {
        color: CATEGORY_COLOR_MAPPING[categoryLabel] ?? '#000000',
        label: categoryLabel,
      },
      location: {
        latitude: item.location.lat,
        longitude: item.location.lng,
        description: item.location.label,
      },
      tags: itemTags,
      label: item.title,
      color: CATEGORY_COLOR_MAPPING[categoryLabel] ?? '#000000',
    }
  })

  const listing = cleanedData.find((item) => item.slug === listingSlug)

  if (!listing) {
    console.log(`[RW] Listing not found for slug ${listingSlug}`)
    return null
  }

  return listing
}

export const dynamicParams = true
export const revalidate = 86400
