import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { auth } from '@auth'
import { markNotificationsSeen } from '@db/notificationRepository'

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const ids = Array.isArray(body?.ids) ? body.ids : []
    const notificationIds = ids
      .map((id: unknown) => Number(id))
      .filter((id: number) => Number.isInteger(id))

    await markNotificationsSeen(session.user.id, notificationIds)

    return Response.json({ success: true })
  } catch (e) {
    console.error(`[RW] Unable to mark notifications as seen - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      { error: 'Unable to mark notifications as seen.' },
      { status: 500 },
    )
  }
}
