import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

export async function GET() {
  try {
    // A listing can live in multiple webs via placements, and each placement is
    // its own URL (web subdomain + placement slug), so we build the sitemap from
    // placements rather than listings.
    const placements = await prisma.listingPlacement.findMany({
      where: {
        web: {
          published: true,
          deletedAt: null,
        },
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

    const listings = placements.map((p) => ({
      slug: p.slug,
      updatedAt: p.listing.updatedAt,
      web: p.web,
    }))

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
