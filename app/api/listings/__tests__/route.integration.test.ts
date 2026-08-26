import {
  createCategory,
  createListing,
  createTag,
  createUser,
  createUserWithWebAccess,
  createWeb,
} from '@/test/factories'
import { request } from '@/test/http'
import { signInAs } from '@/test/session'
import { WebRole } from '@prisma-client'
import { describe, expect, it } from 'vitest'
import prisma from '@prisma-rw'
import { GET, POST } from '../route.ts'

const newListingForm = (fields: Record<string, string> = {}) => {
  const form = new FormData()
  form.set('title', 'Food Hub')
  form.set('slug', 'food-hub')
  form.set('description', 'A food hub')
  form.set('email', '')
  form.set('website', '')
  form.set('tags', '')
  form.set('relations', '')
  form.set('seekingVolunteers', 'false')
  Object.entries(fields).forEach(([key, value]) => form.set(key, value))
  return form
}

const post = (form: FormData) =>
  POST(request('/api/listings', { method: 'POST', body: form }))

describe('GET /api/listings', () => {
  it('refuses to return every listing in every web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await createListing(web.id, { title: 'Food Hub', slug: 'food-hub' })

    const response = await GET(request('/api/listings'))

    expect(response.status).toBe(400)
  })

  it('returns the listings of the web it was asked for', async () => {
    const bristol = await createWeb({ slug: 'bristol' })
    const cambridge = await createWeb({ slug: 'cambridge' })
    await createListing(bristol.id, { title: 'Food Hub', slug: 'food-hub' })
    await createListing(cambridge.id, { title: 'Bike Kitchen' })

    const response = await GET(request('/api/listings?web=bristol'))

    expect(response.status).toBe(200)
    const { listings } = await response.json()
    expect(listings.map((l) => l.title)).toEqual(['Food Hub'])
  })
})

describe('POST /api/listings', () => {
  it('accepts an anonymous proposal', async () => {
    const web = await createWeb({ slug: 'bristol' })

    const response = await post(
      newListingForm({ webId: String(web.id), pending: 'true' }),
    )

    expect(response.status).toBe(201)
    expect((await prisma.listing.findFirst())?.pending).toBe(true)
  })

  it('forces an anonymous listing to be pending, whatever the form says', async () => {
    const web = await createWeb({ slug: 'bristol' })

    const response = await post(
      newListingForm({ webId: String(web.id), pending: 'false' }),
    )

    expect(response.status).toBe(201)
    expect((await prisma.listing.findFirst())?.pending).toBe(true)
  })

  it('forces a signed-in stranger to be pending', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const stranger = await createUser()
    signInAs({ id: stranger.id, email: stranger.email })

    await post(newListingForm({ webId: String(web.id), pending: 'false' }))

    expect((await prisma.listing.findFirst())?.pending).toBe(true)
  })

  it('lets an editor of the web publish straight away', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await post(
      newListingForm({ webId: String(web.id), pending: 'false' }),
    )

    expect(response.status).toBe(201)
    expect((await prisma.listing.findFirst())?.pending).toBe(false)
  })

  it('records the signed-in user as proposer, not whoever the form names', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const stranger = await createUser()
    const someoneElse = await createUser()
    signInAs({ id: stranger.id, email: stranger.email })

    await post(
      newListingForm({
        webId: String(web.id),
        pending: 'true',
        proposerId: someoneElse.id,
      }),
    )

    expect((await prisma.listing.findFirst())?.proposerId).toBe(stranger.id)
  })

  it('ignores a featured date on a proposal', async () => {
    const web = await createWeb({ slug: 'bristol' })

    await post(
      newListingForm({
        webId: String(web.id),
        pending: 'false',
        featured: new Date('2026-01-01').toISOString(),
      }),
    )

    const placement = await prisma.listingPlacement.findFirst()
    expect(placement?.featured).toBeNull()
  })

  it('ignores a category belonging to another web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const theirCategory = await createCategory(otherWeb.id)

    await post(
      newListingForm({
        webId: String(web.id),
        pending: 'true',
        category: String(theirCategory.id),
      }),
    )

    expect((await prisma.listingPlacement.findFirst())?.categoryId).toBeNull()
  })

  it('ignores tags belonging to another web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const theirTag = await createTag(otherWeb.id)

    await post(
      newListingForm({
        webId: String(web.id),
        pending: 'true',
        tags: String(theirTag.id),
      }),
    )

    const placement = await prisma.listingPlacement.findFirst({
      include: { tags: true },
    })
    expect(placement?.tags).toEqual([])
  })

  it('does not let a proposal relate itself to an existing listing', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const existing = await createListing(web.id)

    await post(
      newListingForm({
        webId: String(web.id),
        pending: 'true',
        relations: String(existing.id),
      }),
    )

    const related = await prisma.listing.findUnique({
      where: { id: existing.id },
      include: { relations: true },
    })
    expect(related?.relations).toEqual([])
  })

  it('404s for a soft-deleted web instead of creating an orphan', async () => {
    const web = await createWeb({ slug: 'bristol', deletedAt: new Date() })

    const response = await post(
      newListingForm({ webId: String(web.id), pending: 'true' }),
    )

    expect(response.status).toBe(404)
    expect(await prisma.listing.count()).toBe(0)
  })
})
