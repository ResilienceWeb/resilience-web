import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  try {
    const listingId = Number(params.id)
    if (Number.isNaN(listingId)) {
      return Response.json({ error: 'Invalid listing id' }, { status: 400 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { pending: true },
    })

    if (!listing) {
      return Response.json({ approved: false }, { status: 404 })
    }

    const approved = !listing.pending

    return Response.json(
      { approved },
      {
        headers: {
          'Cache-Control':
            'public, max-age=0, s-maxage=600, stale-while-revalidate=300',
        },
      },
    )
  } catch (e) {
    console.error(`[RW] Unable to get listing status - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      { error: 'Unable to get listing status' },
      { status: 500 },
    )
  }
}
