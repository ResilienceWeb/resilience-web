import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import type { AnalyticsEventInput } from '@db/analyticsRepository'
import { isBot, recordEvents } from '@db/analyticsRepository'

const VALID_EVENT_TYPES = [
  'view',
  'action_volunteer',
  'action_contact',
  'action_donate',
  'action_newsletter',
  'action_resources',
  'action_corporate_volunteering',
]

/** One request carries a whole session, so cap what a single caller can write. */
const MAX_EVENTS_PER_REQUEST = 50
const MAX_COUNT_PER_EVENT = 100

function parseEvent(raw: any): AnalyticsEventInput | null {
  if (!raw || typeof raw !== 'object') return null

  const { listingId, webId, eventType } = raw
  if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) return null
  if (!Number.isInteger(webId)) return null
  if (listingId !== undefined && !Number.isInteger(listingId)) return null

  // A missing or malformed count means one occurrence.
  const rawCount = Number(raw.count ?? 1)
  const count =
    Number.isFinite(rawCount) && rawCount > 0
      ? Math.min(Math.floor(rawCount), MAX_COUNT_PER_EVENT)
      : 1

  return listingId
    ? { listingId, webId, eventType, count }
    : { webId, eventType, count }
}

export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent')
    if (isBot(userAgent)) {
      return Response.json({ ok: true })
    }

    const body = await request.json()

    // The batched shape, or the single event a cached older bundle still posts.
    const rawEvents = Array.isArray(body?.events) ? body.events : [body]

    if (rawEvents.length > MAX_EVENTS_PER_REQUEST) {
      return Response.json({ error: 'Too many events' }, { status: 400 })
    }

    const events = rawEvents
      .map(parseEvent)
      .filter((event): event is AnalyticsEventInput => event !== null)

    if (events.length === 0) {
      return Response.json({ error: 'No valid events' }, { status: 400 })
    }

    await recordEvents(events)

    return Response.json({ ok: true })
  } catch (e) {
    console.error(`[RW] Unable to track analytics event - ${e}`)
    Sentry.captureException(e)
    return Response.json({ ok: true })
  }
}
