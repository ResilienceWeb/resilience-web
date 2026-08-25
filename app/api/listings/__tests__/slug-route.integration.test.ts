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
import { DELETE, PUT } from '../[slug]/route.ts'

const listingForm = (fields: Record<string, string> = {}) => {
  const form = new FormData()
  form.set('title', 'Food Hub')
  form.set('slug', 'food-hub')
  form.set('website', '')
  form.set('description', 'A food hub')
  form.set('email', '')
  form.set('tags', '')
  form.set('removedTags', '')
  form.set('relations', '')
  form.set('removedRelations', '')
  form.set('seekingVolunteers', 'false')
  form.set('inactive', 'false')
  form.set('noPhysicalLocation', 'false')
  form.set('removeLocation', 'false')
  Object.entries(fields).forEach(([key, value]) => form.set(key, value))
  return form
}

// PUT identifies the listing from the form's `id`, not from the URL segment,
// so it takes no params.
const put = (slug: string, form: FormData) =>
  PUT(request(`/api/listings/${slug}`, { method: 'PUT', body: form }))

const del = (slug: string, webId: number) =>
  DELETE(
    request(`/api/listings/${slug}`, { method: 'DELETE', body: { webId } }),
    params({ slug }),
  )

describe('PUT /api/listings/[slug]', () => {
  it('rejects an anonymous caller and leaves the listing alone', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const listing = await createListing(web.id, {
      title: 'Original',
      slug: 'food-hub',
    })

    const response = await put(
      'food-hub',
      listingForm({ id: String(listing.id), webId: String(web.id) }),
    )

    expect(response.status).toBe(403)
    expect(
      (await prisma.listing.findUnique({ where: { id: listing.id } }))?.title,
    ).toBe('Original')
  })

  it('rejects an editor of a different web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const listing = await createListing(web.id, {
      title: 'Original',
      slug: 'food-hub',
    })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const { user } = await createUserWithWebAccess(otherWeb.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await put(
      'food-hub',
      listingForm({ id: String(listing.id), webId: String(web.id) }),
    )

    expect(response.status).toBe(403)
    expect(
      (await prisma.listing.findUnique({ where: { id: listing.id } }))?.title,
    ).toBe('Original')
  })

  it('rejects a webId the caller owns when the listing is not in that web', async () => {
    // `prisma.listing.update` is keyed on the listing alone, so passing a web
    // you *can* edit was a way to reach a listing you cannot.
    const web = await createWeb({ slug: 'bristol' })
    const theirListing = await createListing(web.id, {
      title: 'Original',
      slug: 'food-hub',
    })
    const myWeb = await createWeb({ slug: 'cambridge' })
    const { user } = await createUserWithWebAccess(myWeb.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await put(
      'food-hub',
      listingForm({ id: String(theirListing.id), webId: String(myWeb.id) }),
    )

    expect(response.status).toBe(404)
    expect(
      (await prisma.listing.findUnique({ where: { id: theirListing.id } }))
        ?.title,
    ).toBe('Original')
  })

  it('lets an editor of the web update the listing', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const listing = await createListing(web.id, {
      title: 'Original',
      slug: 'food-hub',
    })
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await put(
      'food-hub',
      listingForm({
        id: String(listing.id),
        webId: String(web.id),
        title: 'Bristol Food Hub',
      }),
    )

    expect(response.status).toBe(200)
    expect(
      (await prisma.listing.findUnique({ where: { id: listing.id } }))?.title,
    ).toBe('Bristol Food Hub')
  })

  it('lets a global admin update a listing in any web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const listing = await createListing(web.id, {
      title: 'Original',
      slug: 'food-hub',
    })
    const admin = await createUser({ role: 'admin' })
    signInAs({ id: admin.id, email: admin.email, role: 'admin' })

    const response = await put(
      'food-hub',
      listingForm({
        id: String(listing.id),
        webId: String(web.id),
        title: 'Renamed',
      }),
    )

    expect(response.status).toBe(200)
  })

  it('resolves the web itself when the form omits webId', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const listing = await createListing(web.id, {
      title: 'Original',
      slug: 'food-hub',
    })
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await put(
      'food-hub',
      listingForm({ id: String(listing.id) }),
    )

    expect(response.status).toBe(200)
  })
})

describe('DELETE /api/listings/[slug]', () => {
  it('rejects an anonymous caller and keeps the listing', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await createListing(web.id, { slug: 'food-hub' })

    const response = await del('food-hub', web.id)

    expect(response.status).toBe(403)
    expect(await prisma.listing.count()).toBe(1)
  })

  it('rejects an editor of a different web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await createListing(web.id, { slug: 'food-hub' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const { user } = await createUserWithWebAccess(otherWeb.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await del('food-hub', web.id)

    expect(response.status).toBe(403)
    expect(await prisma.listing.count()).toBe(1)
  })

  it('lets an editor of the web delete it', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await createListing(web.id, { slug: 'food-hub' })
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await del('food-hub', web.id)

    expect(response.status).toBe(200)
    expect(await prisma.listing.count()).toBe(0)
  })
})
