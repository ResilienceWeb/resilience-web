import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { auth } from '@auth'
import {
  deleteNotification,
  updateNotification,
} from '@db/notificationRepository'
import { notificationSchema, toRepositoryInput } from '../validation'

async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (session?.user?.role !== 'admin') return null
  return session
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin(request)
    if (!session) {
      return Response.json(
        { error: "You don't have enough permissions to perform this action." },
        { status: 403 },
      )
    }

    const { id } = await props.params
    const notificationId = Number(id)
    if (!Number.isInteger(notificationId)) {
      return Response.json(
        { error: 'Invalid notification id' },
        { status: 400 },
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

    const notification = await updateNotification(
      notificationId,
      toRepositoryInput(parsed.data),
    )

    return Response.json({ notification })
  } catch (e) {
    console.error(`[RW] Unable to update notification - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      { error: 'Unable to update notification.' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin(request)
    if (!session) {
      return Response.json(
        { error: "You don't have enough permissions to perform this action." },
        { status: 403 },
      )
    }

    const { id } = await props.params
    const notificationId = Number(id)
    if (!Number.isInteger(notificationId)) {
      return Response.json(
        { error: 'Invalid notification id' },
        { status: 400 },
      )
    }

    await deleteNotification(notificationId)

    return Response.json({ success: true })
  } catch (e) {
    console.error(`[RW] Unable to delete notification - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      { error: 'Unable to delete notification.' },
      { status: 500 },
    )
  }
}
