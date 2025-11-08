import { WebRole } from '@prisma/client'
import prisma from '@prisma-rw'
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
    where: { email },
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
    where: { webId },
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
      web: { slug: webSlug },
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

  return prisma.webAccess.create({
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
}

/**
 * Remove a user's access from a web
 */
export async function removeUserFromWeb(email: string, webId: number) {
  return prisma.webAccess.delete({
    where: {
      user_web_access: { email, webId },
    },
  })
}

/**
 * Update a user's role for a specific web
 */
export async function updateUserRole(
  email: string,
  webId: number,
  role: WebRole,
) {
  return prisma.webAccess.update({
    where: {
      user_web_access: { email, webId },
    },
    data: { role },
    include: {
      user: true,
      web: true,
    },
  })
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
 * Get all webs that a user has access to
 */
export async function getUserAccessibleWebs(email: string) {
  const webAccess = await prisma.webAccess.findMany({
    where: { email },
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
