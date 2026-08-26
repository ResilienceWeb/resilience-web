import { createListing, createWeb } from '@/test/factories'
import { request } from '@/test/http'
import { describe, expect, it } from 'vitest'
import prisma from '@prisma-rw'
import { POST as track } from '../route.ts'

/** A real browser user agent — `isBot` drops anything that looks like a crawler. */
const BROWSER =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

const post = (body: unknown, userAgent = BROWSER) =>
  track(
    request('/api/analytics/track', {
      method: 'POST',
      body,
      headers: { 'user-agent': userAgent },
    }),
  )

const webCounts = () =>
  prisma.webAnalyticsDaily.findMany({
    select: { eventType: true, count: true },
  })

describe('POST /api/analytics/track', () => {
  it('records a whole session of events in one request', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const listing = await createListing(web.id)

    const response = await post({
      events: [
        { webId: web.id, eventType: 'view', count: 3 },
        {
          listingId: listing.id,
          webId: web.id,
          eventType: 'view',
          count: 2,
        },
        {
          listingId: listing.id,
          webId: web.id,
          eventType: 'action_contact',
          count: 1,
        },
      ],
    })

    expect(response.status).toBe(200)
    expect(await webCounts()).toEqual([{ eventType: 'view', count: 3 }])
    expect(
      await prisma.listingAnalyticsDaily.findMany({
        select: { eventType: true, count: true },
        orderBy: { eventType: 'asc' },
      }),
    ).toEqual([
      { eventType: 'action_contact', count: 1 },
      { eventType: 'view', count: 2 },
    ])
  })

  it('adds to the day already being counted rather than starting again', async () => {
    const web = await createWeb({ slug: 'bristol' })

    await post({ events: [{ webId: web.id, eventType: 'view', count: 4 }] })
    await post({ events: [{ webId: web.id, eventType: 'view', count: 6 }] })

    expect(await webCounts()).toEqual([{ eventType: 'view', count: 10 }])
  })

  it('still accepts a single unbatched event from an older client', async () => {
    const web = await createWeb({ slug: 'bristol' })

    const response = await post({ webId: web.id, eventType: 'view' })

    expect(response.status).toBe(200)
    expect(await webCounts()).toEqual([{ eventType: 'view', count: 1 }])
  })

  it('ignores a crawler', async () => {
    const web = await createWeb({ slug: 'bristol' })

    await post(
      { events: [{ webId: web.id, eventType: 'view', count: 1 }] },
      'Googlebot/2.1',
    )

    expect(await webCounts()).toEqual([])
  })

  it('drops events it does not recognise, and keeps the rest', async () => {
    const web = await createWeb({ slug: 'bristol' })

    await post({
      events: [
        { webId: web.id, eventType: 'drop_database', count: 1 },
        { webId: web.id, eventType: 'view', count: 1 },
      ],
    })

    expect(await webCounts()).toEqual([{ eventType: 'view', count: 1 }])
  })

  it('rejects a batch with nothing valid in it', async () => {
    const web = await createWeb({ slug: 'bristol' })

    const response = await post({
      events: [{ webId: web.id, eventType: 'drop_database', count: 1 }],
    })

    expect(response.status).toBe(400)
    expect(await webCounts()).toEqual([])
  })

  it('refuses a batch large enough to be an attempt to hammer the database', async () => {
    const web = await createWeb({ slug: 'bristol' })

    const response = await post({
      events: Array.from({ length: 51 }, () => ({
        webId: web.id,
        eventType: 'view',
        count: 1,
      })),
    })

    expect(response.status).toBe(400)
    expect(await webCounts()).toEqual([])
  })

  it('caps how far a single event can advance a counter', async () => {
    const web = await createWeb({ slug: 'bristol' })

    await post({
      events: [{ webId: web.id, eventType: 'view', count: 1_000_000 }],
    })

    expect(await webCounts()).toEqual([{ eventType: 'view', count: 100 }])
  })
})
