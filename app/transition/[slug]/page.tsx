import truncate from 'lodash/truncate'
import Listing from '../../[subdomain]/[slug]/Listing'
import { COLOR_MAPPING } from '../utils'
import { generateSlug } from '@helpers/utils'

export default async function TransitionListingPage({ params }) {
  const listing = await getListing({
    listingSlug: params.slug,
  })

  if (!listing) {
    console.log(`[RW] Listing not found for slug ${params.slug}`)
    return null
  }

  return <Listing listing={listing} />
}

export async function generateMetadata({ params }) {
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
  const response = await fetch(
    'https://transitiongroups.org/wp-json/cds/v1/initiatives?country=GB&per_page=10000',
    { cache: 'force-cache' },
  )
  const { body: listings } = await response.json()

  return listings.map((l) => ({
    slug: l.slug,
  }))
}

async function getListing({ listingSlug }): Promise<any> {
  const response = await fetch(
    'https://transitiongroups.org/wp-json/cds/v1/initiatives?country=GB&per_page=10000',
    { cache: 'force-cache' },
  )
  const { body: data } = await response.json()

  const cleanedData = data.map((item) => {
    const categoryLabel = item.hubs.replace(/&amp;/g, '&')

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
        color: COLOR_MAPPING[categoryLabel],
        label: categoryLabel,
      },
      label: item.title,
      color: COLOR_MAPPING[categoryLabel],
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
