import truncate from 'lodash/truncate'
import type { Listing as ListingType } from '@prisma/client'
import prisma from '@prisma-rw'
import { exclude } from '@helpers/utils'
import Listing from './Listing'

export default async function ListingPage({ params }) {
  const listing = await getListing({
    webSlug: params.subdomain,
    listingSlug: params.slug,
  })

  if (!listing) {
    console.log(
      `[RW] Listing not found for slugs ${params.subdomain}, ${params.slug}`,
    )
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
    description: truncatedDescription,
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

export async function getListing({
  webSlug,
  listingSlug,
}): Promise<ListingType> {
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
          image: true,
          category: {
            select: {
              id: true,
              color: true,
              label: true,
            },
          },
        },
      },
      edits: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!listingData) {
    console.log(`[RW] Listing not found for slugs ${webSlug}, ${listingSlug}`)
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
