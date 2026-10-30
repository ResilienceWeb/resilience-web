import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { findTagUsableInWeb } from '@db/tagRepository'
import { resolveTagWeb } from '../../authorization.ts'

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const tagId = Number(params.id)
  const body = await request.json()

  const { webId, error } = await resolveTagWeb(request, tagId, body)
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
    // A retired shared tag, or one the web hasn't added, stays where it is but
    // goes nowhere new
    const canAdd = (await findTagUsableInWeb(tagId, webId)) !== null
    const [listingIdsToConnect, listingIdsToDisconnect] = await Promise.all([
      canAdd ? idsInThisWeb(addedListingIds) : [],
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
