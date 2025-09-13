import * as Sentry from '@sentry/nextjs'
import { auth } from '@auth'
import { getWebAccessStats, isUserOwnerOfWeb } from '@db/webAccessRepository'
import { getWebBySlug } from '@db/webRepository'

export async function GET(request: Request) {
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

    const searchParams = new URL(request.url).searchParams
    const webSlug = searchParams.get('web')
    const webId = searchParams.get('webId')

    if (!webSlug && !webId) {
      return Response.json(
        { error: 'Missing required parameter: web or webId' },
        { status: 400 },
      )
    }

    let targetWebId = webId ? parseInt(webId) : null
    if (webSlug && !targetWebId) {
      const web = await getWebBySlug(webSlug)
      if (!web) {
        return Response.json({ error: 'Web not found' }, { status: 404 })
      }
      targetWebId = web.id
    }

    const isOwner = await isUserOwnerOfWeb(session.user.email, targetWebId)
    if (!isOwner && session.user.role !== 'admin') {
      return Response.json(
        { error: "You don't have enough permissions to view web statistics." },
        { status: 403 },
      )
    }

    const stats = await getWebAccessStats(targetWebId)
    return Response.json({ stats })
  } catch (e) {
    console.error(`[RW] Unable to fetch web access stats - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      { error: `Unable to fetch web access stats - ${e}` },
      { status: 500 },
    )
  }
}
