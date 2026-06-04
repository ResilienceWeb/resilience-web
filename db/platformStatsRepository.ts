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
