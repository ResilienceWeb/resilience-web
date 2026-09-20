import * as Sentry from '@sentry/nextjs'
import { GraphQLClient } from 'graphql-request'

/**
 * Webs whose events tab is fed by a PlaceCal neighbourhood. The key is the web
 * slug, which is also the PlaceCal subdomain the event links point at.
 */
const PLACECAL_NEIGHBOURHOOD_ID: Record<string, number> = {
  norwich: 14629,
}

/** How far ahead of today we ask PlaceCal for. */
const WINDOW_DAYS = 14

export interface PlaceCalEventAddress {
  streetAddress?: string
}

export interface PlaceCalEventOrganizer {
  id: string
  name: string
}

export interface PlaceCalEvent {
  id: string
  name: string
  startDate: string
  endDate: string
  address?: PlaceCalEventAddress
  organizer?: PlaceCalEventOrganizer
}

interface EventsResponse {
  eventsByFilter: PlaceCalEvent[]
}

export function getPlaceCalNeighbourhoodId(
  webSlug: string,
): number | undefined {
  return PLACECAL_NEIGHBOURHOOD_ID[webSlug]
}

/**
 * Drops events that have already finished. An event that started earlier today
 * but is still running counts as upcoming — the end, not the start, is what
 * makes it worth showing.
 *
 * This runs on the client, against the visitor's clock, which is what keeps
 * finished events off a page whose events were fetched hours ago.
 */
export function filterUpcomingEvents<T extends { endDate: string }>(
  events: T[],
  now: Date = new Date(),
): T[] {
  return events.filter((event) => {
    const end = new Date(event.endDate).getTime()
    // An unparseable date is not a reason to hide an event.
    return Number.isNaN(end) || end > now.getTime()
  })
}

// PlaceCal wants `YYYY-MM-DD HH:mm`, in local time.
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day} 00:00`
}

// Only the fields the events tab actually renders. Asking for `description`
// and `summary` too quadrupled the payload (26.5KB against 6KB for Norwich's
// fortnight), and it ships to every visitor of the web page whether or not
// they ever open the events tab.
const query = `
  query GetEventsByFilter($neighbourhoodId: Int!, $fromDate: String!, $toDate: String!) {
    eventsByFilter(
      neighbourhoodId: $neighbourhoodId
      fromDate: $fromDate
      toDate: $toDate
    ) {
      id
      name
      startDate
      endDate
      address {
        streetAddress
      }
      organizer {
        id
        name
      }
    }
  }
`

/**
 * The window starts at midnight today rather than at `now`, because PlaceCal
 * filters on start time — asking from `now` would hide an event that is
 * currently running. `filterUpcomingEvents` trims the finished ones on the
 * client instead.
 *
 * Returns [] rather than throwing: PlaceCal being down should cost a web its
 * events tab, not its whole page.
 */
export async function fetchPlaceCalEvents(
  webSlug: string,
): Promise<PlaceCalEvent[]> {
  const neighbourhoodId = getPlaceCalNeighbourhoodId(webSlug)
  if (neighbourhoodId === undefined) {
    return []
  }

  const today = new Date()
  const windowEnd = new Date()
  windowEnd.setDate(today.getDate() + WINDOW_DAYS)

  const eventsClient = new GraphQLClient(process.env.PLACECAL_GRAPHQL_URL || '')

  try {
    const response = await eventsClient.request<EventsResponse>(query, {
      neighbourhoodId,
      fromDate: formatDate(today),
      toDate: formatDate(windowEnd),
    })

    return response.eventsByFilter ?? []
  } catch (error) {
    console.error('[RW] Error fetching PlaceCal events:', error)
    Sentry.captureException(error)
    return []
  }
}
