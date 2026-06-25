import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { auth } from '@auth'
import { getNotificationsForViewer } from '@db/notificationRepository'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return Response.json({ items: [] })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        createdAt: true,
        webAccess: { select: { webId: true } },
      },
    })

    if (!dbUser) {
      return Response.json({ items: [] })
    }

    const notifications = await getNotificationsForViewer({
      id: session.user.id,
      role: session.user.role,
      webIds: dbUser.webAccess.map((w) => w.webId),
      joinedAt: dbUser.createdAt,
    })

    const items = notifications.map((n) => {
      const receipt = n.receipts[0]
      return {
        id: n.id,
        title: n.title,
        body: n.body,
        url: n.url,
        urlLabel: n.urlLabel,
        severity: n.severity,
        createdAt: n.createdAt,
        seenAt: receipt?.seenAt ?? null,
        clickedAt: receipt?.clickedAt ?? null,
      }
    })

    return Response.json({ items })
  } catch (e) {
    console.error(`[RW] Unable to fetch notifications - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      { error: "We couldn't load your notifications right now." },
      { status: 500 },
    )
  }
}
