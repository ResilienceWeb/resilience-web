import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { auth } from '@auth'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = session.user.email
  const name = session.user.name?.trim()

  try {
    const response = await fetch(
      'https://connect.mailerlite.com/api/subscribers',
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          ...(name ? { fields: { name } } : {}),
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
        },
      },
    )
    const data = await response.json()

    if (data.error) {
      return Response.json({ error: data.error }, { status: 400 })
    }

    return Response.json({ error: null }, { status: 201 })
  } catch (error) {
    console.error(`[RW] Failed to subscribe user to newsletter - ${error}`)
    Sentry.captureException(error)
    return Response.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 400 },
    )
  }
}
