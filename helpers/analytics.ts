export function trackListingEvent(
  listingId: number,
  webId: number,
  eventType: string,
) {
  fetch('/api/analytics/track', {
    method: 'POST',
    body: JSON.stringify({ listingId, webId, eventType }),
    keepalive: true,
  }).catch(() => {})
}

export function trackWebEvent(webId: number, eventType: string) {
  fetch('/api/analytics/track', {
    method: 'POST',
    body: JSON.stringify({ webId, eventType }),
    keepalive: true,
  }).catch(() => {})
}
