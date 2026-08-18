import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getSessionSafe } from '@auth'
import { stringToBoolean } from '@helpers/utils'
import { getListingEditsByWeb } from '@db/listingEditRepository'
import { canUserEditWebBySlug } from '@db/webAccessRepository'

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> },
) {
  const params = await props.params
  const slug = params.slug

  const session = await getSessionSafe(request.headers)

  if (!session?.user) {
    return new Response('Unauthorized', {
      status: 403,
    })
  }

  // Pending edits are this web's private moderation queue, so scope the read to
  // people who can actually act on them rather than to anyone with an account.
  const isAllowed =
    session.user.role === 'admin' ||
    (await canUserEditWebBySlug(session.user.email, slug))

  if (!isAllowed) {
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
