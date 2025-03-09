import { exclude } from '@helpers/utils'
import prisma from '@prisma-rw'

export default async function getListing({ webSlug, listingSlug }) {
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
      socials: true,
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

  return listing as Listing
}
