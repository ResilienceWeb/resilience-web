import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  try {
    const listingId = Number(params.id)
    const { webId } = await request.json()

    if (!webId) {
      return Response.json(
        { error: 'webId is required to unfeature a listing' },
        { status: 400 },
      )
    }

    const placement = await prisma.listingPlacement.update({
      where: {
        listingPlacementPair: { listingId, webId },
      },
      data: { featured: null },
      include: {
        web: { select: { slug: true } },
        listing: { select: { id: true, title: true } },
      },
    })

    revalidatePath(`/${placement.web.slug}`)

    return Response.json({
      listing: { ...placement.listing, featured: placement.featured },
    })
  } catch (e) {
    console.error(`[RW] Unable to unfeature listing - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to unfeature listing - ${e}`, {
      status: 500,
    })
  }
}
