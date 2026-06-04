import prisma from '@prisma-rw'

const BOT_PATTERN =
  /bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|facebookexternalhit|twitterbot|linkedinbot/i

export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true
  return BOT_PATTERN.test(userAgent)
}

export async function recordListingEvent(
  listingId: number,
  webId: number,
  eventType: string,
) {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  await prisma.listingAnalyticsDaily.upsert({
    where: {
      listing_web_date_event: {
        listingId,
        webId,
        date: today,
        eventType,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      listingId,
      webId,
      date: today,
      eventType,
      count: 1,
    },
  })
}

export async function recordWebEvent(webId: number, eventType: string) {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  await prisma.webAnalyticsDaily.upsert({
    where: {
      web_date_event: {
        webId,
        date: today,
        eventType,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      webId,
      date: today,
      eventType,
      count: 1,
    },
  })
}

export async function getListingAnalyticsForWeb(
  webId: number,
  days: number = 30,
) {
  const startDate = new Date()
  startDate.setUTCHours(0, 0, 0, 0)
  startDate.setUTCDate(startDate.getUTCDate() - days)

  const analytics = await prisma.listingAnalyticsDaily.groupBy({
    by: ['listingId', 'eventType'],
    where: {
      webId,
      date: { gte: startDate },
      web: { deletedAt: null },
    },
    _sum: { count: true },
  })

  const placements = await prisma.listingPlacement.findMany({
    where: { webId, web: { deletedAt: null } },
    select: {
      slug: true,
      listing: { select: { id: true, title: true } },
    },
  })

  const listingMap = new Map(
    placements.map((p) => [p.listing.id, { ...p.listing, slug: p.slug }]),
  )

  const grouped: Record<
    number,
    {
      listingId: number
      title: string
      slug: string
      views: number
      actionClicks: number
      actions: Record<string, number>
    }
  > = {}

  for (const row of analytics) {
    const listing = listingMap.get(row.listingId)
    if (!listing) continue

    if (!grouped[row.listingId]) {
      grouped[row.listingId] = {
        listingId: row.listingId,
        title: listing.title,
        slug: listing.slug,
        views: 0,
        actionClicks: 0,
        actions: {},
      }
    }

    const total = row._sum.count ?? 0
    if (row.eventType === 'view') {
      grouped[row.listingId].views = total
    } else {
      grouped[row.listingId].actionClicks += total
      grouped[row.listingId].actions[row.eventType] = total
    }
  }

  return Object.values(grouped).sort((a, b) => b.views - a.views)
}

export async function getWebAnalytics(webId: number, days: number = 30) {
  const startDate = new Date()
  startDate.setUTCHours(0, 0, 0, 0)
  startDate.setUTCDate(startDate.getUTCDate() - days)

  const analytics = await prisma.webAnalyticsDaily.groupBy({
    by: ['eventType'],
    where: {
      webId,
      date: { gte: startDate },
      web: { deletedAt: null },
    },
    _sum: { count: true },
  })

  const result: Record<string, number> = {}
  for (const row of analytics) {
    result[row.eventType] = row._sum.count ?? 0
  }

  return result
}

export type DailyAnalyticsPoint = {
  date: string
  webVisits: number
  listingViews: number
  actionClicks: number
}

export async function getDailyAnalyticsForWeb(
  webId: number,
  days: number = 30,
): Promise<DailyAnalyticsPoint[]> {
  const startDate = new Date()
  startDate.setUTCHours(0, 0, 0, 0)
  startDate.setUTCDate(startDate.getUTCDate() - days)

  const [webDaily, listingDaily] = await Promise.all([
    prisma.webAnalyticsDaily.groupBy({
      by: ['date', 'eventType'],
      where: { webId, date: { gte: startDate }, web: { deletedAt: null } },
      _sum: { count: true },
    }),
    prisma.listingAnalyticsDaily.groupBy({
      by: ['date', 'eventType'],
      where: { webId, date: { gte: startDate }, web: { deletedAt: null } },
      _sum: { count: true },
    }),
  ])

  // Pre-seed every day in the range so the chart shows continuous data,
  // including days with no activity.
  const buckets = new Map<string, DailyAnalyticsPoint>()
  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate)
    d.setUTCDate(startDate.getUTCDate() + i)
    const key = d.toISOString().slice(0, 10)
    buckets.set(key, {
      date: key,
      webVisits: 0,
      listingViews: 0,
      actionClicks: 0,
    })
  }

  for (const row of webDaily) {
    const key = row.date.toISOString().slice(0, 10)
    const bucket = buckets.get(key)
    if (!bucket) continue
    if (row.eventType === 'view') {
      bucket.webVisits += row._sum.count ?? 0
    }
  }

  for (const row of listingDaily) {
    const key = row.date.toISOString().slice(0, 10)
    const bucket = buckets.get(key)
    if (!bucket) continue
    if (row.eventType === 'view') {
      bucket.listingViews += row._sum.count ?? 0
    } else {
      bucket.actionClicks += row._sum.count ?? 0
    }
  }

  return Array.from(buckets.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  )
}

export async function deleteOldAnalytics(olderThanDays: number = 365) {
  const cutoff = new Date()
  cutoff.setUTCHours(0, 0, 0, 0)
  cutoff.setUTCDate(cutoff.getUTCDate() - olderThanDays)

  const [listingResult, webResult] = await Promise.all([
    prisma.listingAnalyticsDaily.deleteMany({
      where: { date: { lt: cutoff } },
    }),
    prisma.webAnalyticsDaily.deleteMany({
      where: { date: { lt: cutoff } },
    }),
  ])

  return {
    listingRowsDeleted: listingResult.count,
    webRowsDeleted: webResult.count,
  }
}
