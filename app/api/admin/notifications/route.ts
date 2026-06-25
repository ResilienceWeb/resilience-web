import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { auth } from '@auth'
import {
  createNotification,
  listNotificationsWithStats,
} from '@db/notificationRepository'
import { notificationSchema, toRepositoryInput } from './validation'

async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (session?.user?.role !== 'admin') {
    return { session: null }
  }
  return { session }
}

export async function GET(request: NextRequest) {
  try {
    const { session } = await requireAdmin(request)
    if (!session) {
      return Response.json(
        { error: "You don't have enough permissions to perform this action." },
        { status: 403 },
      )
    }

    const notifications = await listNotificationsWithStats()
    return Response.json({ notifications })
  } catch (e) {
    console.error(`[RW] Unable to list notifications - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      { error: 'Unable to list notifications.' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session } = await requireAdmin(request)
    if (!session) {
      return Response.json(
        { error: "You don't have enough permissions to perform this action." },
        { status: 403 },
      )
    }

    const json = await request.json().catch(() => ({}))
    const parsed = notificationSchema.safeParse(json)
    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid notification', issues: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const notification = await createNotification(
      session.user.id,
      toRepositoryInput(parsed.data),
    )

    return Response.json({ notification }, { status: 201 })
  } catch (e) {
    console.error(`[RW] Unable to create notification - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      { error: 'Unable to create notification.' },
      { status: 500 },
    )
  }
}
