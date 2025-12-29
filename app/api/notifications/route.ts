import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@auth'

export async function GET(request: NextRequest) {
  const notifications = []
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  let subscribedToMailingList = false
  const response = await fetch(
    `https://connect.mailerlite.com/api/subscribers/${session?.user.email}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
      },
    },
  )
  const responseJson = await response.json()

  if (responseJson.data?.status === 'active') {
    subscribedToMailingList = true
  }

  if (!subscribedToMailingList) {
    notifications.push({
      id: 'subscribe-to-mailing-list',
      type: 'system',
      title: 'Subscribe to our mailing list',
      body: 'Subscribe to receive updates about our platform.',
      severity: 'info',
      createdAt: null,
      readAt: null as string | null,
      dismissedAt: null as string | null,
      link: '/admin/user-settings',
    })
  }

  return NextResponse.json({ items: notifications })
}
