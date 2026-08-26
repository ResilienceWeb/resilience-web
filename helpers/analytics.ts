/**
 * Client-side analytics queue.
 *
 * Each event used to be its own `POST /api/analytics/track` the moment it
 * happened — a serverless invocation and a Postgres upsert per page view.
 * Events are now counted in memory and sent once, when the page goes away, so
 * a whole session is normally a single request.
 */

const ENDPOINT = '/api/analytics/track'

/** Flush early rather than let a very long session build an unbounded queue. */
const MAX_QUEUED_EVENTS = 25

type QueuedEvent = {
  listingId?: number
  webId: number
  eventType: string
  count: number
}

const queue = new Map<string, QueuedEvent>()
let listenersAttached = false

function flush() {
  if (queue.size === 0) return

  const events = [...queue.values()]
  queue.clear()

  const body = JSON.stringify({ events })

  // `sendBeacon` survives the page unloading, which `fetch` only sometimes
  // does. It returns false if the payload is refused, hence the fallback.
  try {
    const blob = new Blob([body], { type: 'application/json' })
    if (navigator.sendBeacon?.(ENDPOINT, blob)) return
  } catch {
    // Fall through to fetch.
  }

  fetch(ENDPOINT, {
    method: 'POST',
    body,
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}

function attachListeners() {
  if (listenersAttached || typeof document === 'undefined') return
  listenersAttached = true

  // `hidden` covers backgrounding on mobile, where `pagehide` may never fire.
  // Flushing twice is harmless — the queue empties on the first.
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}

function enqueue(event: Omit<QueuedEvent, 'count'>) {
  if (typeof window === 'undefined') return

  attachListeners()

  const key = `${event.listingId ?? ''}:${event.webId}:${event.eventType}`
  const existing = queue.get(key)
  if (existing) {
    existing.count += 1
  } else {
    queue.set(key, { ...event, count: 1 })
  }

  if (queue.size >= MAX_QUEUED_EVENTS) flush()
}

export function trackListingEvent(
  listingId: number,
  webId: number,
  eventType: string,
) {
  enqueue({ listingId, webId, eventType })
}

export function trackWebEvent(webId: number, eventType: string) {
  enqueue({ webId, eventType })
}

/** For anywhere that needs the queue drained right now. */
export function flushAnalytics() {
  flush()
}
