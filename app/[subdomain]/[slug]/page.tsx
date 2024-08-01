import truncate from 'lodash/truncate'
import type { Listing as ListingType } from '@prisma/client'
import prisma from '../../../prisma/client'
import Listing from './Listing'

export default async function ListingPage({ params }) {
  const listing = await getListing({
    webSlug: params.subdomain,
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
    webSlug: params.subdomain,
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
  const listings = await prisma.listing.findMany({
    include: {
      web: {
        select: {
          slug: true,
        },
      },
    },
  })

  return listings.map((l) => ({
    subdomain: l.web.slug,
    slug: l.slug,
  }))
}

function exclude(data, keys) {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !keys.includes(key)),
  )
}

async function getListing({ webSlug, listingSlug }): Promise<ListingType> {
  const listingData = await prisma.listing.findFirst({
    where: {
      slug: listingSlug,
      ...(webSlug
        ? {
            web: {
              slug: {
                contains: webSlug,
              },
            },
          }
        : {}),
    },
    include: {
      location: {
        select: {
          latitude: true,
          longitude: true,
          description: true,
        },
      },
      category: {
        select: {
          id: true,
          color: true,
          label: true,
        },
      },
      tags: {
        select: {
          id: true,
          label: true,
        },
      },
      relations: {
        select: {
          id: true,
          slug: true,
          title: true,
          featured: true,
          category: {
            select: {
              id: true,
              color: true,
              label: true,
            },
          },
        },
      },
    },
  })

  if (!listingData) {
    return null
  }

  const listing = exclude(listingData, [
    'createdAt',
    'updatedAt',
    'notes',
    'inactive',
  ])

  return listing as ListingType
}

export const dynamicParams = true
export const revalidate = 60
