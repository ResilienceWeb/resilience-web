import {
  createListing,
  createUser,
  createUserWithWebAccess,
  createWeb,
} from '@/test/factories'
import { params, request } from '@/test/http'
import { signInAs } from '@/test/session'
import { WebRole } from '@prisma-client'
import { describe, expect, it } from 'vitest'
import prisma from '@prisma-rw'
import { PATCH as feature } from '../[id]/feature/route.ts'
import { PATCH as unfeature } from '../[id]/unfeature/route.ts'

const call = (
  handler: typeof feature,
  path: string,
  listingId: number,
  webId: number,
) =>
  handler(
    request(`/api/listing/${listingId}/${path}`, {
      method: 'PATCH',
      body: { webId },
    }),
    params({ id: String(listingId) }),
  )

const featuredOf = async (listingId: number, webId: number) =>
  (
    await prisma.listingPlacement.findUnique({
      where: { listingPlacementPair: { listingId, webId } },
    })
  )?.featured

describe('PATCH /api/listing/[id]/feature', () => {
  it('rejects an anonymous caller and leaves the placement unfeatured', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const listing = await createListing(web.id)

    const response = await call(feature, 'feature', listing.id, web.id)

    expect(response.status).toBe(403)
    expect(await featuredOf(listing.id, web.id)).toBeNull()
  })

  it('rejects an editor of a different web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const listing = await createListing(web.id)
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const { user } = await createUserWithWebAccess(otherWeb.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await call(feature, 'feature', listing.id, web.id)

    expect(response.status).toBe(403)
    expect(await featuredOf(listing.id, web.id)).toBeNull()
  })

  it('lets an editor of the web feature it', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const listing = await createListing(web.id)
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await call(feature, 'feature', listing.id, web.id)

    expect(response.status).toBe(200)
    expect(await featuredOf(listing.id, web.id)).toBeInstanceOf(Date)
  })

  it('lets a global admin feature a listing in any web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const listing = await createListing(web.id)
    const admin = await createUser({ role: 'admin' })
    signInAs({ id: admin.id, email: admin.email, role: 'admin' })

    expect((await call(feature, 'feature', listing.id, web.id)).status).toBe(
      200,
    )
  })
})

describe('PATCH /api/listing/[id]/unfeature', () => {
  it('rejects an editor of a different web and keeps it featured', async () => {
    const featuredUntil = new Date('2099-01-01')
    const web = await createWeb({ slug: 'bristol' })
    const listing = await createListing(web.id, { featured: featuredUntil })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const { user } = await createUserWithWebAccess(otherWeb.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await call(unfeature, 'unfeature', listing.id, web.id)

    expect(response.status).toBe(403)
    expect(await featuredOf(listing.id, web.id)).toEqual(featuredUntil)
  })

  it('lets an editor of the web unfeature it', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const listing = await createListing(web.id, {
      featured: new Date('2099-01-01'),
    })
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await call(unfeature, 'unfeature', listing.id, web.id)

    expect(response.status).toBe(200)
    expect(await featuredOf(listing.id, web.id)).toBeNull()
  })
})
