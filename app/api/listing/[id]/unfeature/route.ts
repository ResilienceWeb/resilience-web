import { revalidatePath } from 'next/cache'
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

    const listing = await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        featured: null,
      },
      include: {
        web: {
          select: {
            slug: true,
          },
        },
      },
    })

    revalidatePath(`/${listing.web.slug}`)

    return Response.json({
      listing,
    })
  } catch (e) {
    console.error(`[RW] Unable to unfeature listing - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to unfeature listing - ${e}`, {
      status: 500,
    })
  }
}
