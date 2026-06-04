import prisma from '@prisma-rw'

export type DailyCountPoint = {
  date: string
  count: number
}

/**
 * Number of users that signed up on each day within the given window.
 * Every day in the range is pre-seeded to zero so charts stay continuous.
 */
export async function getUserSignupsByDay(
  days: number = 90,
): Promise<DailyCountPoint[]> {
  const startDate = new Date()
  startDate.setUTCHours(0, 0, 0, 0)
  startDate.setUTCDate(startDate.getUTCDate() - days)

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true },
  })

  const buckets = new Map<string, DailyCountPoint>()
  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate)
    d.setUTCDate(startDate.getUTCDate() + i)
    const key = d.toISOString().slice(0, 10)
    buckets.set(key, { date: key, count: 0 })
  }

  for (const user of users) {
    const key = user.createdAt.toISOString().slice(0, 10)
    const bucket = buckets.get(key)
    if (bucket) bucket.count += 1
  }

  return Array.from(buckets.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  )
}

/**
 * Number of listings created on each day within the given window.
 */
export async function getListingsCreatedByDay(
  days: number = 90,
): Promise<DailyCountPoint[]> {
  const startDate = new Date()
  startDate.setUTCHours(0, 0, 0, 0)
  startDate.setUTCDate(startDate.getUTCDate() - days)

  const listings = await prisma.listing.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true },
  })

  const buckets = new Map<string, DailyCountPoint>()
  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate)
    d.setUTCDate(startDate.getUTCDate() + i)
    const key = d.toISOString().slice(0, 10)
    buckets.set(key, { date: key, count: 0 })
  }

  for (const listing of listings) {
    const key = listing.createdAt.toISOString().slice(0, 10)
    const bucket = buckets.get(key)
    if (bucket) bucket.count += 1
  }

  return Array.from(buckets.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  )
}

export type DailyAnalyticsPoint = {
  date: string
  webVisits: number
  listingViews: number
  actionClicks: number
}

/**
 * Platform-wide analytics (across every non-deleted web) for each day in the
 * window: web visits, listing views and action clicks.
 */
export async function getPlatformAnalyticsByDay(
  days: number = 90,
): Promise<DailyAnalyticsPoint[]> {
  const startDate = new Date()
  startDate.setUTCHours(0, 0, 0, 0)
  startDate.setUTCDate(startDate.getUTCDate() - days)

  const [webDaily, listingDaily] = await Promise.all([
    prisma.webAnalyticsDaily.groupBy({
      by: ['date', 'eventType'],
      where: { date: { gte: startDate }, web: { deletedAt: null } },
      _sum: { count: true },
    }),
    prisma.listingAnalyticsDaily.groupBy({
      by: ['date', 'eventType'],
      where: { date: { gte: startDate }, web: { deletedAt: null } },
      _sum: { count: true },
    }),
  ])

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
