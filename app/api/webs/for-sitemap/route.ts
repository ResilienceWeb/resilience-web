import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

export async function GET() {
  try {
    const webs = await prisma.web.findMany({
      where: {
        published: true,
        deletedAt: null,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })
    return Response.json({
      webs,
    })
  } catch (e) {
    console.error(`[RW] Unable to fetch webs for generating sitemap - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to fetch webs for generating sitemap - ${e}`, {
      status: 500,
    })
  }
}
