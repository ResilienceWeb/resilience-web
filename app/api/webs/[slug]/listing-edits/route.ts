import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { auth } from '@auth'
import { stringToBoolean } from '@helpers/utils'
import { getListingEditsByWeb } from '@db/listingEditRepository'

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> },
) {
  const params = await props.params
  const slug = params.slug

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user) {
    return new Response('Unauthorized', {
      status: 403,
    })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const includeAcceptedParam = searchParams.get('includeAccepted')
    const includeAccepted = includeAcceptedParam
      ? stringToBoolean(includeAcceptedParam)
      : false

    const listingEdits = await getListingEditsByWeb(slug, includeAccepted)

    return Response.json({
      listingEdits,
    })
  } catch (e) {
    console.error(`[RW] Unable to fetch listing edits - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to fetch listing edits - ${e}`, {
      status: 500,
    })
  }
}
