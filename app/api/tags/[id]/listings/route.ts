import type { NextRequest } from 'next/server'
import { requireWebEditor } from '@/lib/api-authorization'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { findTag } from '../../authorization.ts'

/**
 * A web tag only ever reaches its own web. A shared tag reaches every web, so
 * the caller names the one they edit, and only its placements are touched.
 */
async function resolveWeb(request: NextRequest, tagId: number, body) {
  const tag = await findTag(tagId)
  if (!tag) {
    return {
      error: Response.json({ error: 'Tag not found' }, { status: 404 }),
    }
  }

  const webId = tag.webId ?? Number(body?.webId)
  if (!Number.isInteger(webId)) {
    return {
      error: Response.json(
        { error: 'webId is required for a shared tag' },
        { status: 400 },
      ),
    }
  }

  const denied = await requireWebEditor(request, webId)
  if (denied) return { error: denied }

  return { tag, webId }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const tagId = Number(params.id)
  const body = await request.json()

  const { tag, webId, error } = await resolveWeb(request, tagId, body)
  if (error) return error

  const { addedListingIds, removedListingIds } = body

  const idsInThisWeb = async (ids: unknown) => {
    const numeric = (Array.isArray(ids) ? ids : [])
      .map(Number)
      .filter(Number.isInteger)
    if (numeric.length === 0) {
      return []
    }
    const placements = await prisma.listingPlacement.findMany({
      where: { id: { in: numeric }, webId },
      select: { id: true },
    })
    return placements
  }

  try {
    const [listingIdsToConnect, listingIdsToDisconnect] = await Promise.all([
      // A retired shared tag stays where it is but goes nowhere new
      tag.retiredAt ? [] : idsInThisWeb(addedListingIds),
      idsInThisWeb(removedListingIds),
    ])

    const updated = await prisma.tag.update({
      where: {
        id: tagId,
      },
      data: {
        listings: {
          connect: listingIdsToConnect,
          disconnect: listingIdsToDisconnect,
        },
      },
    })

    return Response.json({ data: updated })
  } catch (e) {
    console.error(`[RW] Unable to add tag to listings - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to add tag to listings - ${e}`, {
      status: 500,
    })
  }
}

/** Takes the tag off every listing in one web, which is how a web drops a shared tag. */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const tagId = Number(params.id)
  const body = await request.json().catch(() => ({}))

  const { webId, error } = await resolveWeb(request, tagId, body)
  if (error) return error

  try {
    const placements = await prisma.listingPlacement.findMany({
      where: { webId, tags: { some: { id: tagId } } },
      select: { id: true },
    })

    const updated = await prisma.tag.update({
      where: { id: tagId },
      data: { listings: { disconnect: placements } },
    })

    return Response.json({ data: updated })
  } catch (e) {
    console.error(`[RW] Unable to remove tag from listings - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to remove tag from listings - ${e}`, {
      status: 500,
    })
  }
}
