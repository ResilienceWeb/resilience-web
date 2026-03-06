import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { auth } from '@auth'
import { getListingEditStats } from '@db/listingEditRepository'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    if (!session?.user) {
      return Response.json(
        { error: "You don't have enough permissions to perform this action." },
        { status: 403 },
      )
    }

    const listingEdits = await getListingEditStats()

    return Response.json({
      data: {
        listingEdits,
      },
    })
  } catch (e) {
    console.error(`[RW] Unable to fetch admin stats - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to fetch admin stats - ${e}`, {
      status: 500,
    })
  }
}
