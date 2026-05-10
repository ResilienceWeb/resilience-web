import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import {
  isBot,
  recordListingEvent,
  recordWebEvent,
} from '@db/analyticsRepository'

const VALID_EVENT_TYPES = [
  'view',
  'action_volunteer',
  'action_contact',
  'action_donate',
  'action_newsletter',
  'action_resources',
  'action_corporate_volunteering',
]

export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent')
    if (isBot(userAgent)) {
      return Response.json({ ok: true })
    }

    const body = await request.json()
    const { listingId, webId, eventType } = body

    if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
      return Response.json({ error: 'Invalid event type' }, { status: 400 })
    }

    if (!listingId && !webId) {
      return Response.json(
        { error: 'Either listingId or webId is required' },
        { status: 400 },
      )
    }

    if (listingId && typeof listingId !== 'number') {
      return Response.json({ error: 'Invalid listingId' }, { status: 400 })
    }

    if (webId && typeof webId !== 'number') {
      return Response.json({ error: 'Invalid webId' }, { status: 400 })
    }

    if (listingId) {
      if (!webId) {
        return Response.json(
          { error: 'webId is required when tracking a listing event' },
          { status: 400 },
        )
      }
      await recordListingEvent(listingId, webId, eventType)
    }

    if (webId && !listingId) {
      await recordWebEvent(webId, eventType)
    }

    return Response.json({ ok: true })
  } catch (e) {
    console.error(`[RW] Unable to track analytics event - ${e}`)
    Sentry.captureException(e)
    return Response.json({ ok: true })
  }
}
