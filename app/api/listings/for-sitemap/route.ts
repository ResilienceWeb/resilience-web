import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { canonicalPlacement, visibleWebPlacements } from '@db/listingRepository'

export async function GET() {
  try {
    // Only each listing's canonical page: its other placements point search
    // engines there, and listing them too would contradict that.
    const placements = await prisma.listingPlacement.findMany({
      where: {
        ...visibleWebPlacements.where,
        listing: {
          image: {
            not: null,
          },
          description: {
            not: '',
          },
        },
      },
      select: {
        id: true,
        listingId: true,
        slug: true,
        web: {
          select: {
            slug: true,
          },
        },
        listing: {
          select: {
            updatedAt: true,
          },
        },
      },
    })

    const byListing = Map.groupBy(placements, (p) => p.listingId)
    const listings = [...byListing.values()].map((listingPlacements) => {
      const p = canonicalPlacement(listingPlacements)
      return {
        slug: p.slug,
        updatedAt: p.listing.updatedAt,
        web: p.web,
      }
    })

    return Response.json({
      listings,
    })
  } catch (e) {
    console.error(`[RW] Unable to fetch listings for generating sitemap - ${e}`)
    Sentry.captureException(e)
    return new Response(
      `Unable to fetch listings for generating sitemap - ${e}`,
      {
        status: 500,
      },
    )
  }
}
