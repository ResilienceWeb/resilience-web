import type { NextRequest } from 'next/server'
import { requireWebEditor } from '@/lib/api-authorization'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { findTagWebId } from '../../authorization.ts'

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const tagId = Number(params.id)

  const webId = await findTagWebId(tagId)
  if (webId === null) {
    return Response.json({ error: 'Tag not found' }, { status: 404 })
  }

  const denied = await requireWebEditor(request, webId)
  if (denied) return denied

  const { addedListingIds, removedListingIds } = await request.json()

  // A tag is per-web, so it may only ever reach placements in its own web.
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
      idsInThisWeb(addedListingIds),
      idsInThisWeb(removedListingIds),
    ])

    const tag = await prisma.tag.update({
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

    return Response.json({ data: tag })
  } catch (e) {
    console.error(`[RW] Unable to add tag to listings - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to add tag to listings - ${e}`, {
      status: 500,
    })
  }
}
