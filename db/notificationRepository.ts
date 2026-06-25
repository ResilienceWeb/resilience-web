import prisma from '@prisma-rw'

export type NotificationAudience = 'ALL' | 'ADMINS' | 'WEB'

type NotificationInput = {
  title: string
  body: string
  url?: string | null
  urlLabel?: string | null
  severity?: string
  audience?: NotificationAudience
  publishAt?: Date | null
  expiresAt?: Date | null
  targetWebIds?: number[]
}

type FeedViewer = {
  id: string
  role?: string | null
  webIds: number[]
  joinedAt: Date
}

// Returns notifications that are currently live (within their publish/expiry
// window) and that the viewer is eligible to see, joined with the viewer's own
// receipt so the client knows what is read/clicked.
export async function getNotificationsForViewer(viewer: FeedViewer) {
  const now = new Date()
  const isAdmin = viewer.role === 'admin'

  const audienceFilters: any[] = [{ audience: 'ALL' }]
  if (isAdmin) {
    audienceFilters.push({ audience: 'ADMINS' })
  }
  if (viewer.webIds.length > 0) {
    audienceFilters.push({
      audience: 'WEB',
      targetWebs: { some: { webId: { in: viewer.webIds } } },
    })
  }

  return prisma.notification.findMany({
    where: {
      AND: [
        { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        // Only show notifications that went live on or after the viewer signed
        // up, so new users don't see a backlog from before they had an account.
        {
          OR: [
            { publishAt: { gte: viewer.joinedAt } },
            { publishAt: null, createdAt: { gte: viewer.joinedAt } },
          ],
        },
        { OR: audienceFilters },
      ],
    },
    include: {
      receipts: {
        where: { userId: viewer.id },
        select: { seenAt: true, clickedAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// Marks the given notifications as seen for a user. Preserves the original
// seenAt timestamp if one already exists (so "first seen" is never overwritten).
export async function markNotificationsSeen(
  userId: string,
  notificationIds: number[],
) {
  if (notificationIds.length === 0) return

  const now = new Date()

  await prisma.notificationReceipt.createMany({
    data: notificationIds.map((notificationId) => ({
      notificationId,
      userId,
      seenAt: now,
    })),
    skipDuplicates: true,
  })

  await prisma.notificationReceipt.updateMany({
    where: {
      userId,
      notificationId: { in: notificationIds },
      seenAt: null,
    },
    data: { seenAt: now },
  })
}

// Records a click for a user on a notification. A click also implies the
// notification was seen, so seenAt is backfilled if it was not already set.
export async function markNotificationClicked(
  userId: string,
  notificationId: number,
) {
  const now = new Date()
  const existing = await prisma.notificationReceipt.findUnique({
    where: { notification_user: { notificationId, userId } },
    select: { seenAt: true, clickedAt: true },
  })

  if (!existing) {
    await prisma.notificationReceipt.create({
      data: { notificationId, userId, seenAt: now, clickedAt: now },
    })
    return
  }

  await prisma.notificationReceipt.update({
    where: { notification_user: { notificationId, userId } },
    data: {
      seenAt: existing.seenAt ?? now,
      clickedAt: existing.clickedAt ?? now,
    },
  })
}

export async function createNotification(
  createdById: string,
  input: NotificationInput,
) {
  return prisma.notification.create({
    data: {
      title: input.title,
      body: input.body,
      url: input.url ?? null,
      urlLabel: input.urlLabel ?? null,
      severity: input.severity ?? 'info',
      audience: input.audience ?? 'ALL',
      publishAt: input.publishAt ?? null,
      expiresAt: input.expiresAt ?? null,
      createdById,
      targetWebs:
        input.audience === 'WEB' && input.targetWebIds?.length
          ? { create: input.targetWebIds.map((webId) => ({ webId })) }
          : undefined,
    },
  })
}

export async function updateNotification(id: number, input: NotificationInput) {
  return prisma.notification.update({
    where: { id },
    data: {
      title: input.title,
      body: input.body,
      url: input.url ?? null,
      urlLabel: input.urlLabel ?? null,
      severity: input.severity ?? 'info',
      audience: input.audience ?? 'ALL',
      publishAt: input.publishAt ?? null,
      expiresAt: input.expiresAt ?? null,
      targetWebs: {
        deleteMany: {},
        ...(input.audience === 'WEB' && input.targetWebIds?.length
          ? { create: input.targetWebIds.map((webId) => ({ webId })) }
          : {}),
      },
    },
  })
}

export async function deleteNotification(id: number) {
  // Receipts and web targets are removed via onDelete: Cascade.
  return prisma.notification.delete({ where: { id } })
}

// The number of users eligible to receive a notification, used as the
// denominator for the "seen" stat. Because users only see notifications that
// went live after they signed up, the denominator counts users who had joined
// by the time the notification went live (`liveAt`). v1 only uses ALL.
async function getAudienceSize(
  audience: string,
  targetWebIds: number[],
  liveAt: Date,
): Promise<number> {
  if (audience === 'ADMINS') {
    return prisma.user.count({
      where: { role: 'admin', createdAt: { lte: liveAt } },
    })
  }
  if (audience === 'WEB' && targetWebIds.length > 0) {
    const rows = await prisma.webAccess.findMany({
      where: { webId: { in: targetWebIds }, createdAt: { lte: liveAt } },
      select: { email: true },
      distinct: ['email'],
    })
    return rows.length
  }
  // ALL: every user who had an account when the notification went live.
  return prisma.user.count({ where: { createdAt: { lte: liveAt } } })
}

// Admin view: all notifications with aggregated seen/clicked counts and the
// audience size denominator.
export async function listNotificationsWithStats() {
  const notifications = await prisma.notification.findMany({
    include: {
      createdBy: { select: { name: true, email: true } },
      targetWebs: { select: { webId: true } },
      _count: { select: { receipts: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return Promise.all(
    notifications.map(async (n) => {
      const targetWebIds = n.targetWebs.map((t) => t.webId)
      const liveAt = n.publishAt ?? n.createdAt
      const [seenCount, clickedCount, audienceSize] = await Promise.all([
        prisma.notificationReceipt.count({
          where: { notificationId: n.id, seenAt: { not: null } },
        }),
        prisma.notificationReceipt.count({
          where: { notificationId: n.id, clickedAt: { not: null } },
        }),
        getAudienceSize(n.audience, targetWebIds, liveAt),
      ])

      return {
        id: n.id,
        title: n.title,
        body: n.body,
        url: n.url,
        urlLabel: n.urlLabel,
        severity: n.severity,
        audience: n.audience,
        targetWebIds,
        publishAt: n.publishAt,
        expiresAt: n.expiresAt,
        createdAt: n.createdAt,
        createdBy: n.createdBy,
        seenCount,
        clickedCount,
        audienceSize,
      }
    }),
  )
}
