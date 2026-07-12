import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getSessionSafe } from '@auth'
import {
  getUserWebAccess,
  isUserOwnerOfWeb,
  canUserEditWeb,
} from '@db/webAccessRepository'
import { getWebBySlug } from '@db/webRepository'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionSafe(request.headers)

    if (!session?.user) {
      return Response.json(
        { error: "You don't have enough permissions to perform this action." },
        { status: 403 },
      )
    }

    const searchParams = new URL(request.url).searchParams
    const webSlug = searchParams.get('web')
    const webId = searchParams.get('webId')
    const checkType = searchParams.get('check') // 'owner', 'edit', 'access'

    if (!webSlug && !webId) {
      return Response.json(
        { error: 'Missing required parameter: web or webId' },
        { status: 400 },
      )
    }

    // Get web ID if slug provided
    let targetWebId = webId ? parseInt(webId) : null
    if (webSlug && !targetWebId) {
      const web = await getWebBySlug(webSlug)
      if (!web) {
        return Response.json({ error: 'Web not found' }, { status: 404 })
      }
      targetWebId = web.id
    }

    const userEmail = session.user.email

    switch (checkType) {
      case 'owner': {
        const isOwner = await isUserOwnerOfWeb(userEmail, targetWebId)
        return Response.json({ isOwner })
      }
      case 'edit': {
        const canEdit = await canUserEditWeb(userEmail, targetWebId)
        return Response.json({ canEdit })
      }

      case 'access':
      default: {
        const access = await getUserWebAccess(userEmail, targetWebId)
        return Response.json({
          hasAccess: !!access,
          role: access?.role || null,
          isOwner: access?.role === 'OWNER',
          canEdit: access?.role === 'OWNER' || access?.role === 'EDITOR',
        })
      }
    }
  } catch (e) {
    console.error(`[RW] Unable to check web access - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      {
        error:
          "We couldn't check your access right now. Please try again in a moment.",
      },
      { status: 500 },
    )
  }
}
