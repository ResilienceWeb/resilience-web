import { WebRole } from '@prisma-client'
import { describe, expect, it } from 'vitest'
import prisma from '@prisma-rw'
import { FEATURES } from '@helpers/features'
import {
  createListing,
  createUser,
  createUserWithWebAccess,
  createWeb,
  grantWebAccess,
} from '../../test/factories/index.ts'
import {
  addUserToWeb,
  canUserEditWeb,
  canUserShareListing,
  getUserAccessibleWebs,
  getUserAllWebAccess,
  getWebAccessStats,
  getWebAllUserAccess,
  getWebAllUserAccessBySlug,
  isCurrentUserOwnerOfWeb,
  isUserOwnerOfWeb,
  removeUserFromWeb,
  updateUserRole,
} from '../webAccessRepository.ts'

describe('addUserToWeb', () => {
  it('creates the user record if they have never signed in', async () => {
    const web = await createWeb()

    await addUserToWeb('invitee@example.com', web.id, WebRole.EDITOR)

    const user = await prisma.user.findUnique({
      where: { email: 'invitee@example.com' },
    })
    expect(user?.emailVerified).toBe(false)
  })

  it('does not clobber an existing user', async () => {
    const web = await createWeb()
    const existing = await createUser({ name: 'Existing Person' })

    await addUserToWeb(existing.email, web.id, WebRole.OWNER)

    const user = await prisma.user.findUnique({
      where: { email: existing.email },
    })
    expect(user?.name).toBe('Existing Person')
    expect(user?.emailVerified).toBe(true)
  })
})

describe('role checks', () => {
  it('treats OWNER as owner and editor', async () => {
    const web = await createWeb()
    const { user } = await createUserWithWebAccess(web.id, WebRole.OWNER)

    expect(await isUserOwnerOfWeb(user.email, web.id)).toBe(true)
    expect(await canUserEditWeb(user.email, web.id)).toBe(true)
  })

  it('treats EDITOR as editor but not owner', async () => {
    const web = await createWeb()
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)

    expect(await isUserOwnerOfWeb(user.email, web.id)).toBe(false)
    expect(await canUserEditWeb(user.email, web.id)).toBe(true)
  })

  it('denies a user with no access record', async () => {
    const web = await createWeb()
    const stranger = await createUser()

    expect(await isUserOwnerOfWeb(stranger.email, web.id)).toBe(false)
    expect(await canUserEditWeb(stranger.email, web.id)).toBe(false)
  })

  it('does not leak access between webs', async () => {
    const web = await createWeb()
    const otherWeb = await createWeb()
    const { user } = await createUserWithWebAccess(web.id, WebRole.OWNER)

    expect(await isUserOwnerOfWeb(user.email, otherWeb.id)).toBe(false)
    expect(await canUserEditWeb(user.email, otherWeb.id)).toBe(false)
  })

  it('resolves ownership by web slug', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const { user } = await createUserWithWebAccess(web.id, WebRole.OWNER)

    expect(await isCurrentUserOwnerOfWeb(user.email, 'bristol')).toBe(true)
    expect(await isCurrentUserOwnerOfWeb(user.email, 'unknown-web')).toBe(false)
  })

  it('reports no ownership once the web is soft-deleted', async () => {
    const web = await createWeb({ slug: 'bristol', deletedAt: new Date() })
    const { user } = await createUserWithWebAccess(web.id, WebRole.OWNER)

    expect(await isCurrentUserOwnerOfWeb(user.email, 'bristol')).toBe(false)
  })
})

describe('updateUserRole / removeUserFromWeb', () => {
  it('promotes an editor to owner', async () => {
    const web = await createWeb()
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)

    await updateUserRole(user.email, web.id, WebRole.OWNER)

    expect(await isUserOwnerOfWeb(user.email, web.id)).toBe(true)
  })

  it('revokes access entirely', async () => {
    const web = await createWeb()
    const { user } = await createUserWithWebAccess(web.id, WebRole.OWNER)

    await removeUserFromWeb(user.email, web.id)

    expect(await canUserEditWeb(user.email, web.id)).toBe(false)
    // The user themselves is left alone.
    expect(
      await prisma.user.findUnique({ where: { email: user.email } }),
    ).not.toBeNull()
  })
})

describe('listing access by web', () => {
  it('orders owners before editors', async () => {
    const web = await createWeb()
    const { user: editor } = await createUserWithWebAccess(
      web.id,
      WebRole.EDITOR,
    )
    const { user: owner } = await createUserWithWebAccess(web.id, WebRole.OWNER)

    expect((await getWebAllUserAccess(web.id)).map((a) => a.email)).toEqual([
      owner.email,
      editor.email,
    ])
    expect(
      (await getWebAllUserAccessBySlug(web.slug)).map((a) => a.email),
    ).toEqual([owner.email, editor.email])
  })

  it('excludes soft-deleted webs from a user perspective', async () => {
    const live = await createWeb()
    const deleted = await createWeb({ deletedAt: new Date() })
    const user = await createUser()
    await grantWebAccess(user.email, live.id)
    await grantWebAccess(user.email, deleted.id)

    expect(await getUserAllWebAccess(user.email)).toHaveLength(1)
    expect((await getUserAccessibleWebs(user.email)).map((w) => w.id)).toEqual([
      live.id,
    ])
  })

  it('reports counts per role', async () => {
    const web = await createWeb()
    await createUserWithWebAccess(web.id, WebRole.OWNER)
    await createUserWithWebAccess(web.id, WebRole.EDITOR)
    await createUserWithWebAccess(web.id, WebRole.EDITOR)

    expect(await getWebAccessStats(web.id)).toEqual({
      totalUsers: 3,
      owners: 1,
      editors: 2,
    })
  })
})

describe('canUserShareListing', () => {
  const enableSharing = (webId: number) =>
    prisma.webFeature.create({
      data: { webId, feature: FEATURES.shareListings, enabled: true },
    })

  it('allows an editor of a web that has sharing enabled', async () => {
    const web = await createWeb()
    await enableSharing(web.id)
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    const listing = await createListing(web.id)

    expect(await canUserShareListing(user.email, listing.id)).toBe(true)
  })

  it('denies when the feature is disabled', async () => {
    const web = await createWeb()
    await prisma.webFeature.create({
      data: { webId: web.id, feature: FEATURES.shareListings, enabled: false },
    })
    const { user } = await createUserWithWebAccess(web.id, WebRole.OWNER)
    const listing = await createListing(web.id)

    expect(await canUserShareListing(user.email, listing.id)).toBe(false)
  })

  it('denies a user with no access to any web the listing is in', async () => {
    const web = await createWeb()
    await enableSharing(web.id)
    const stranger = await createUser()
    const listing = await createListing(web.id)

    expect(await canUserShareListing(stranger.email, listing.id)).toBe(false)
  })

  it('denies when the listing has no placements', async () => {
    const web = await createWeb()
    await enableSharing(web.id)
    const { user } = await createUserWithWebAccess(web.id, WebRole.OWNER)
    const orphan = await prisma.listing.create({ data: { title: 'Orphan' } })

    expect(await canUserShareListing(user.email, orphan.id)).toBe(false)
  })

  it('denies when the sharing-enabled web is soft-deleted', async () => {
    const web = await createWeb({ deletedAt: new Date() })
    await enableSharing(web.id)
    const { user } = await createUserWithWebAccess(web.id, WebRole.OWNER)
    const listing = await createListing(web.id)

    expect(await canUserShareListing(user.email, listing.id)).toBe(false)
  })
})
