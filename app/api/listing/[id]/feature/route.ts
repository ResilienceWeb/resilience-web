import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

export async function PATCH(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  try {
    const listingId = Number(params.id)

    // Set featured to 7 days from now
    const featuredUntil = new Date()
    featuredUntil.setDate(featuredUntil.getDate() + 7)

    const listing = await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        featured: featuredUntil,
      },
    })

    return Response.json({
      listing,
    })
  } catch (e) {
    console.error(`[RW] Unable to feature listing - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to feature listing - ${e}`, {
      status: 500,
    })
  }
}
