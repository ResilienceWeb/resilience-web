import { cache } from 'react'
import prisma from '@prisma-rw'
import { exclude } from '@helpers/utils'
import {
  canonicalPlacement,
  listingPagePlacements,
  listingUrl,
  otherWebs,
} from '@db/listingRepository'
import { isBuildTime, getListingFromCache } from '../../../lib/build-cache'

type ReachablePlacement = {
  id: number
  slug: string
  web: { slug: string; title: string }
}

/**
 * What the listing page derives from the listing's reachable placements. Shared
 * with `generateStaticParams`, which fills the build cache with the same shape.
 */
export function placementLinks(
  placements: ReachablePlacement[],
  current: { webSlug: string; slug: string },
) {
  const canonical = canonicalPlacement(placements) ?? {
    slug: current.slug,
    web: { slug: current.webSlug },
  }

  return {
    alsoListedIn: otherWebs(placements, current.webSlug).map(
      ({ slug, web }) => ({ slug, web }),
    ),
    canonicalUrl: listingUrl(canonical.web.slug, canonical.slug),
  }
}

/** Label-sorted, as the client hook sorted them. See `getData` in the web page. */
export function sortCategoriesByLabel<T extends { label: string }>(
  categories: T[] = [],
): T[] {
  return [...categories].sort((a, b) => {
    if (a.label < b.label) return -1
    if (a.label > b.label) return 1
    return 0
  })
}

/**
 * Wrapped in `cache()` because the page body and `generateMetadata` both ask
 * for the same listing, and Next only dedupes `fetch`, not Prisma.
 */
const getListing = cache(async function getListing({
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
        ...(webSlug ? { slug: webSlug } : {}),
      },
    },
    include: {
      web: {
        select: {
          id: true,
          slug: true,
          title: true,
          categories: { select: { label: true } },
        },
      },
      category: { select: { id: true, color: true, label: true, icon: true } },
      tags: { select: { id: true, label: true, icon: true } },
      listing: {
        include: {
          socials: true,
          actions: true,
          location: {
            select: { latitude: true, longitude: true, description: true },
          },
          edits: { select: { id: true } },
          placements: listingPagePlacements,
          relations: {
            select: {
              id: true,
              title: true,
              image: true,
              placements: {
                where: { web: { slug: webSlug } },
                select: {
                  slug: true,
                  featured: true,
                  category: {
                    select: { id: true, color: true, label: true, icon: true },
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
    web: {
      ...placementFields.web,
      categories: sortCategoriesByLabel(placementFields.web.categories),
    },
    ...placementLinks(alsoIn, {
      webSlug: placementFields.web.slug,
      slug: placementFields.slug,
    }),
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
})

export default getListing
