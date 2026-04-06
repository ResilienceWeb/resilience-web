export function trackListingEvent(listingId: number, eventType: string) {
  fetch('/api/analytics/track', {
    method: 'POST',
    body: JSON.stringify({ listingId, eventType }),
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
