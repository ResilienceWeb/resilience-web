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
  if (isBuildTime()) {
    const cached = getListingFromCache(webSlug, listingSlug)
    if (cached) {
      return cached
    }
  }

  const placement = await prisma.listingPlacement.findFirst({
    where: {
      slug: listingSlug,
      web: {
        deletedAt: null,
        ...(webSlug ? { slug: { contains: webSlug } } : {}),
      },
    },
    include: {
      web: { select: { id: true, slug: true, title: true } },
      category: { select: { id: true, color: true, label: true } },
      tags: { select: { id: true, label: true } },
      listing: {
        include: {
          socials: true,
          actions: true,
          location: {
            select: { latitude: true, longitude: true, description: true },
          },
          edits: { select: { id: true } },
          // All other webs this listing also lives in — used for the "also in" link.
          placements: {
            where: {
              webId: { not: undefined },
              web: { deletedAt: null, slug: { not: webSlug } },
            },
            select: {
              slug: true,
              web: { select: { slug: true, title: true } },
            },
          },
          relations: {
            select: {
              id: true,
              title: true,
              image: true,
              placements: {
                where: { web: { slug: { contains: webSlug } } },
                select: {
                  slug: true,
                  featured: true,
                  category: {
                    select: { id: true, color: true, label: true },
                  },
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  })

  if (!placement) {
    console.log(`[RW] Listing not found for slugs ${webSlug}, ${listingSlug}`)
    return null
  }

  const { listing: rawListing, ...placementFields } = placement
  const { placements: alsoIn, relations, ...listingCore } = rawListing

  const flattened = {
    ...listingCore,
    slug: placementFields.slug,
    featured: placementFields.featured,
    category: placementFields.category,
    tags: placementFields.tags,
    web: placementFields.web,
    alsoListedIn: alsoIn.map((p) => ({
      slug: p.slug,
      web: p.web,
    })),
    // Only surface relations that ALSO live in the current web — relations without
    // a placement here have no slug/category to render, and exposing them would link
    // off into a 404.
    relations: relations
      .map((r) => {
        const placementForCurrentWeb = r.placements[0]
        if (!placementForCurrentWeb) return null
        return {
          id: r.id,
          title: r.title,
          image: r.image,
          slug: placementForCurrentWeb.slug,
          featured: placementForCurrentWeb.featured,
          category: placementForCurrentWeb.category,
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null),
  }

  const listing = exclude(flattened, ['createdAt', 'updatedAt', 'notes'])

  return listing as Listing
}
