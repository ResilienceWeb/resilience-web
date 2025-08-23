import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        image: {
          not: null,
        },
        description: {
          not: '',
        },
        web: {
          published: true,
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        web: {
          select: {
            slug: true,
          },
        },
      },
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
