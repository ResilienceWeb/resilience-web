import prisma from '@prisma-rw'
import { exclude } from '@helpers/utils'
import { isBuildTime, getListingFromCache } from '../../../lib/build-cache'

export default async function getListing({
  webSlug,
  listingSlug,
}: {
  webSlug: string
  listingSlug: string
}) {
  // During build, try cache first
  if (isBuildTime()) {
    const cached = getListingFromCache(webSlug, listingSlug)
    if (cached) {
      return cached
    }
  }

  // Fallback to DB query (runtime or cache miss)
  const listingData = await prisma.listing.findFirst({
    where: {
      slug: listingSlug,
      web: {
        deletedAt: null,
        ...(webSlug
          ? {
              slug: {
                contains: webSlug,
              },
            }
          : {}),
      },
    },
    include: {
      socials: true,
      actions: true,
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
      web: {
        select: {
          slug: true,
          title: true,
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

  return listing as Listing
}
