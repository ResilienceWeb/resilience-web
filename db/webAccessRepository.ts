import { WebRole } from '@prisma-client'
import prisma from '@prisma-rw'
import { FEATURES } from '@helpers/features'
import { syncSubscriberSegmentationSafe } from '@helpers/syncSubscriberSegmentation'
import { getWebBySlug } from './webRepository'

/**
 * Get a user's access level for a specific web
 */
export async function getUserWebAccess(email: string, webId: number) {
  return prisma.webAccess.findUnique({
    where: {
      user_web_access: { email, webId },
    },
    include: {
      user: true,
      web: true,
    },
  })
}

/**
 * Get all web access records for a specific user
 */
export async function getUserAllWebAccess(email: string) {
  return prisma.webAccess.findMany({
    where: {
      email,
      web: {
        deletedAt: null,
      },
    },
    include: {
      user: true,
      web: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get all users with access to a specific web
 */
export async function getWebAllUserAccess(webId: number) {
  return prisma.webAccess.findMany({
    where: {
      webId,
      web: {
        deletedAt: null,
      },
    },
    include: {
      user: true,
      web: true,
    },
    orderBy: [
      { role: 'desc' }, // OWNER first, then EDITOR
      { createdAt: 'asc' },
    ],
  })
}

/**
 * Get all users with access to a web by web slug
 */
export async function getWebAllUserAccessBySlug(webSlug: string) {
  return prisma.webAccess.findMany({
    where: {
      web: { slug: webSlug, deletedAt: null },
    },
    include: {
      user: true,
      web: true,
    },
    orderBy: [
      { role: 'desc' }, // OWNER first, then EDITOR
      { createdAt: 'asc' },
    ],
  })
}

/**
 * Add a user to a web with a specific role
 */
export async function addUserToWeb(
  email: string,
  webId: number,
  role: WebRole,
) {
  await prisma.user.upsert({
    where: { email },
    create: { email, emailVerified: false },
    update: {},
  })

  const webAccess = await prisma.webAccess.create({
    data: {
      email,
      webId,
      role,
    },
    include: {
      user: true,
      web: true,
    },
  })

  await syncSubscriberSegmentationSafe(email)

  return webAccess
}

/**
 * Remove a user's access from a web
 */
export async function removeUserFromWeb(email: string, webId: number) {
  const deleted = await prisma.webAccess.delete({
    where: {
      user_web_access: { email, webId },
    },
  })

  await syncSubscriberSegmentationSafe(email)

  return deleted
}

/**
 * Update a user's role for a specific web
 */
export async function updateUserRole(
  email: string,
  webId: number,
  role: WebRole,
) {
  const webAccess = await prisma.webAccess.update({
    where: {
      user_web_access: { email, webId },
    },
    data: { role },
    include: {
      user: true,
      web: true,
    },
  })

  await syncSubscriberSegmentationSafe(email)

  return webAccess
}

/**
 * Check if a user is an owner of a specific web
 */
export async function isUserOwnerOfWeb(
  email: string,
  webId: number,
): Promise<boolean> {
  const access = await prisma.webAccess.findUnique({
    where: {
      user_web_access: { email, webId },
    },
    select: { role: true },
  })

  return access?.role === 'OWNER'
}

/**
 * Check if the current user is an owner of a specific web by slug
 */
export async function isCurrentUserOwnerOfWeb(
  email: string,
  webSlug: string,
): Promise<boolean> {
  const web = await getWebBySlug(webSlug)
  if (!web) {
    return false
  }
  return await isUserOwnerOfWeb(email, web.id)
}

/**
 * Check if a user can edit a specific web (OWNER or EDITOR)
 */
export async function canUserEditWeb(
  email: string,
  webId: number,
): Promise<boolean> {
  const access = await prisma.webAccess.findUnique({
    where: {
      user_web_access: { email, webId },
    },
    select: { role: true },
  })

  return access?.role === 'OWNER' || access?.role === 'EDITOR'
}

/**
 * Determine whether a user may share a listing across webs.
 *
 * Allowed if the listing is placed in at least one web that the user can edit
 * (OWNER/EDITOR) and that web has the share-listings feature enabled. Global
 * admins are handled separately by the caller and bypass this check.
 */
export async function canUserShareListing(
  email: string,
  listingId: number,
): Promise<boolean> {
  const placements = await prisma.listingPlacement.findMany({
    where: { listingId },
    select: { webId: true },
  })
  if (placements.length === 0) {
    return false
  }

  const editableWebIds = (
    await prisma.webAccess.findMany({
      where: {
        email,
        webId: { in: placements.map((p) => p.webId) },
        role: { in: [WebRole.OWNER, WebRole.EDITOR] },
      },
      select: { webId: true },
    })
  ).map((a) => a.webId)
  if (editableWebIds.length === 0) {
    return false
  }

  const enabledWeb = await prisma.web.findFirst({
    where: {
      id: { in: editableWebIds },
      deletedAt: null,
      features: {
        some: { feature: FEATURES.shareListings, enabled: true },
      },
    },
    select: { id: true },
  })

  return Boolean(enabledWeb)
}

/**
 * Get all webs that a user has access to
 */
export async function getUserAccessibleWebs(email: string) {
  const webAccess = await prisma.webAccess.findMany({
    where: {
      email,
      web: {
        deletedAt: null,
      },
    },
    include: { web: true },
    orderBy: { createdAt: 'desc' },
  })

  return webAccess.map((access) => ({
    ...access.web,
    role: access.role,
  }))
}

/**
 * Get all owners of a specific web
 */
export async function getWebOwners(webId: number) {
  return prisma.webAccess.findMany({
    where: {
      webId,
      role: 'OWNER',
      web: {
        deletedAt: null,
      },
    },
    include: {
      user: true,
      web: true,
    },
    orderBy: { createdAt: 'asc' },
  })
}

/**
 * Get all editors of a specific web (excluding owners)
 */
export async function getWebEditors(webId: number) {
  return prisma.webAccess.findMany({
    where: {
      webId,
      role: 'EDITOR',
      web: {
        deletedAt: null,
      },
    },
    include: {
      user: true,
      web: true,
    },
    orderBy: { createdAt: 'asc' },
  })
}

/**
 * Get web access statistics
 */
export async function getWebAccessStats(webId: number) {
  const [totalUsers, owners, editors] = await Promise.all([
    prisma.webAccess.count({ where: { webId } }),
    prisma.webAccess.count({ where: { webId, role: 'OWNER' } }),
    prisma.webAccess.count({ where: { webId, role: 'EDITOR' } }),
  ])

  return {
    totalUsers,
    owners,
    editors,
  }
}
