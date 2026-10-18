import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getSessionSafe } from '@auth'
import { subscribe } from '@helpers/mailingList'

export async function POST(request: NextRequest) {
  const session = await getSessionSafe(request.headers)

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = session.user.email

  try {
    await subscribe(email, session.user.name)
    return Response.json({ error: null }, { status: 201 })
  } catch (error) {
    console.error(`[RW] Failed to subscribe user to newsletter - ${error}`)
    Sentry.captureException(error)
    return Response.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 502 },
    )
  }
}
