import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getSessionSafe } from '@auth'
import { markNotificationClicked } from '@db/notificationRepository'

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionSafe(request.headers)

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const notificationId = Number(id)
    if (!Number.isInteger(notificationId)) {
      return Response.json(
        { error: 'Invalid notification id' },
        { status: 400 },
      )
    }

    await markNotificationClicked(session.user.id, notificationId)

    return Response.json({ success: true })
  } catch (e) {
    console.error(`[RW] Unable to record notification click - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      { error: 'Unable to record notification click.' },
      { status: 500 },
    )
  }
}
