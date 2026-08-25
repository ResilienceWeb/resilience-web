import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import { requireWebEditor } from '@/lib/api-authorization'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const webSlug = searchParams.get('web')

    if (!webSlug) {
      return Response.json({ data: [] })
    }

    // Resolve the web up front so the listing count below can be scoped to it.
    // Filtering the count by `webId` is what keeps the query fast: without it
    // Postgres aggregates the entire listing_placements table (every web) on
    // every request, then throws away all but this web's categories.
    const web = await prisma.web.findFirst({
      where: {
        slug: webSlug,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    })

    if (!web) {
      return Response.json({ data: [] })
    }

    const categories = await prisma.category.findMany({
      where: {
        webId: web.id,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        label: true,
        color: true,
        icon: true,
        webId: true,
        // A category only ever belongs to one web, so scoping by webId does not
        // change the count - it just lets the aggregate use the webId index
        _count: {
          select: {
            listings: {
              where: {
                webId: web.id,
              },
            },
          },
        },
      },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    })

    return Response.json({ data: categories })
  } catch (e) {
    console.error(`[RW] Unable to fetch categories - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to fetch categories - ${e}`, {
      status: 500,
    })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const webId = Number(body?.webId)

  if (!Number.isInteger(webId)) {
    return Response.json({ error: 'webId is required' }, { status: 400 })
  }

  const denied = await requireWebEditor(request, webId)
  if (denied) return denied

  try {
    // Enumerated, not spread: `data: body` would let the caller set `webId`
    // past the check above, or reach other webs through `listings`.
    const category = await prisma.category.create({
      data: {
        webId,
        label: body.label,
        ...(body.color ? { color: body.color } : {}),
        ...(body.icon ? { icon: body.icon } : {}),
      },
      include: {
        web: {
          select: {
            slug: true,
          },
        },
      },
    })

    revalidatePath(`/${category.web.slug}`)

    return Response.json({ data: category })
  } catch (e) {
    console.error(`[RW] Unable to create category - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to create category - ${e}`, {
      status: 500,
    })
  }
}
