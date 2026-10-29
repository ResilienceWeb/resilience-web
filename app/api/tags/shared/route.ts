import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

/**
 * The shared tags a web could add, each marked with whether it already has.
 * Retired ones are left out: they can't be added anywhere.
 */
export async function GET(request: NextRequest) {
  try {
    const webSlug = request.nextUrl.searchParams.get('web')
    const web = webSlug
      ? await prisma.web.findFirst({
          where: { slug: webSlug, deletedAt: null },
          select: { id: true },
        })
      : null

    if (!web) {
      return Response.json({ data: [] })
    }

    const tags = await prisma.tag.findMany({
      where: { webId: null, retiredAt: null },
      select: {
        id: true,
        key: true,
        label: true,
        icon: true,
        addedToWebs: { where: { webId: web.id }, select: { webId: true } },
      },
      orderBy: { label: 'asc' },
    })

    return Response.json({
      data: tags.map(({ addedToWebs, ...tag }) => ({
        ...tag,
        added: addedToWebs.length > 0,
      })),
    })
  } catch (e) {
    console.error(`[RW] Unable to fetch shared tags - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to fetch shared tags - ${e}`, {
      status: 500,
    })
  }
}
