import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import { requireWebEditor } from '@/lib/api-authorization'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { isSelectableIcon } from '@helpers/icons'
import { findSharedTagWithLabel, sharedTagConflict } from '@db/tagRepository'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const webSlug = searchParams.get('web')

    if (!webSlug) {
      return Response.json({ data: [] })
    }

    // Resolve the web up front so the listing count below can be scoped to it.
    // Filtering the count by `webId` is what keeps the query fast: without it
    // Postgres joins the whole listing_placements table to the whole
    // placement/tag join table and groups that, on every request.
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

    const tags = await prisma.tag.findMany({
      select: {
        id: true,
        label: true,
        icon: true,
        key: true,
        retiredAt: true,
        webId: true,
        // Scoped to the web: a shared tag is used by listings in many webs,
        // and the scope also lets the aggregate use the webId index
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
      // The web's own tags, the shared tags it has added, and any shared tags
      // its listings still carry. Retired ones are included so they can be
      // seen and removed; the pickers leave them out.
      where: {
        OR: [
          { webId: web.id },
          { webId: null, addedToWebs: { some: { webId: web.id } } },
          { webId: null, listings: { some: { webId: web.id } } },
        ],
      },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    })

    return Response.json({ data: tags })
  } catch (e) {
    console.error(`[RW] Unable to fetch tags - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to fetch tags - ${e}`, {
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

  if (body.icon != null && !isSelectableIcon(body.icon)) {
    return Response.json({ error: 'Unknown icon' }, { status: 400 })
  }

  const sharedTag = await findSharedTagWithLabel(body.label)
  if (sharedTag) {
    return sharedTagConflict(sharedTag)
  }

  try {
    // Enumerated, not spread: `data: body` would let the caller set `webId`
    // past the check above, or reach other webs through `listings`.
    const tag = await prisma.tag.create({
      data: {
        webId,
        label: body.label,
        icon: body.icon ?? null,
      },
      include: {
        web: {
          select: {
            slug: true,
          },
        },
      },
    })

    revalidatePath(`/${tag.web.slug}`)

    return Response.json({ data: tag })
  } catch (e) {
    console.error(`[RW] Unable to create tag - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to create tag - ${e}`, {
      status: 500,
    })
  }
}
