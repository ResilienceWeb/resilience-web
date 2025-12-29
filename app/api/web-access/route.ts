import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { auth } from '@auth'
import { sendEmail } from '@helpers/email'
import WebPermissionsRevokedEmail from '@components/emails/WebPermissionsRevokedEmail'
import {
  getUserWebAccess,
  getUserAllWebAccess,
  getWebAllUserAccessBySlug,
  removeUserFromWeb,
  isUserOwnerOfWeb,
} from '@db/webAccessRepository'
import { getWebById, getWebBySlug } from '@db/webRepository'

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

    const searchParams = new URL(request.url).searchParams
    const webSlug = searchParams.get('web')
    const userEmail = searchParams.get('email')

    if (webSlug) {
      const webAccess = await getWebAllUserAccessBySlug(webSlug)
      return Response.json({ webAccess })
    }

    if (userEmail) {
      if (session.user.role !== 'admin' && session.user.email !== userEmail) {
        return Response.json(
          { error: "You don't have permission to view other users' access." },
          { status: 403 },
        )
      }
      const webAccess = await getUserAllWebAccess(userEmail)
      return Response.json({ webAccess })
    }

    const webAccess = await getUserAllWebAccess(session.user.email)
    return Response.json({ webAccess })
  } catch (e) {
    console.error(`[RW] Unable to fetch web access - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      { error: `Unable to fetch web access - ${e}` },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const body = await request.json()
    const { webId, webSlug, userEmail } = body

    if (!userEmail || (!webId && !webSlug)) {
      return Response.json(
        { error: 'Missing required fields: userEmail and webId or webSlug' },
        { status: 400 },
      )
    }

    let targetWebId = webId
    let selectedWeb
    if (webSlug && !webId) {
      selectedWeb = await getWebBySlug(webSlug)
      if (!selectedWeb) {
        return Response.json({ error: 'Web not found' }, { status: 404 })
      }
      targetWebId = selectedWeb.id
    } else {
      selectedWeb = await getWebById(targetWebId)
    }

    const isOwner = await isUserOwnerOfWeb(session.user.email, targetWebId)
    if (!isOwner && session.user.role !== 'admin') {
      return Response.json(
        { error: "You don't have enough permissions to perform this action." },
        { status: 403 },
      )
    }

    // Prevent owners from removing themselves (unless admin)
    if (session.user.email === userEmail && session.user.role !== 'admin') {
      const userAccess = await getUserWebAccess(userEmail, targetWebId)
      if (userAccess?.role === 'OWNER') {
        return Response.json(
          {
            error:
              'Owners cannot remove themselves from a web. Transfer ownership first or contact an admin.',
          },
          { status: 400 },
        )
      }
    }

    await removeUserFromWeb(userEmail, targetWebId)

    if (selectedWeb) {
      const webPermissionsRevokedEmail = WebPermissionsRevokedEmail({
        webTitle: selectedWeb.title,
        webOwnerEmail: session.user.email,
      })

      sendEmail({
        to: userEmail,
        subject: `You have been removed from the ${selectedWeb.title} Resilience Web team`,
        email: webPermissionsRevokedEmail,
      })
    }

    return Response.json({
      success: true,
      message: `User ${userEmail} removed from web successfully`,
      data: selectedWeb,
    })
  } catch (e) {
    console.error(`[RW] Unable to remove user from web - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      { error: `Unable to remove user from web - ${e}` },
      { status: 500 },
    )
  }
}
