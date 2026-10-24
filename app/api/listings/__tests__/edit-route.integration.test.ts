import {
  createCategory,
  createListing,
  createListingEdit,
  createUser,
  createUserWithWebAccess,
  createTag,
  createWeb,
} from '@/test/factories'
import { params, request } from '@/test/http'
import { signInAs } from '@/test/session'
import { WebRole } from '@prisma-client'
import { describe, expect, it } from 'vitest'
import prisma from '@prisma-rw'
import { DELETE, POST } from '../[slug]/edit/route.ts'

const rejectEdit = (slug: string, webSlug: string) =>
  DELETE(
    request(`/api/listings/${slug}/edit?web=${webSlug}`, { method: 'DELETE' }),
    params({ slug }),
  )

describe('DELETE /api/listings/[slug]/edit', () => {
  const setup = async () => {
    const web = await createWeb({ slug: 'bristol' })
    const listing = await createListing(web.id, { slug: 'food-hub' })
    const proposer = await createUser()
    const edit = await createListingEdit(web.id, listing.id, proposer.id)
    return { web, listing, proposer, edit }
  }

  it('rejects an anonymous caller and keeps the edit', async () => {
    await setup()

    const response = await rejectEdit('food-hub', 'bristol')

    expect(response.status).toBe(401)
    expect(await prisma.listingEdit.count()).toBe(1)
  })

  it('rejects a signed-in stranger and keeps the edit', async () => {
    await setup()
    const stranger = await createUser()
    signInAs({ id: stranger.id, email: stranger.email })

    const response = await rejectEdit('food-hub', 'bristol')

    expect(response.status).toBe(403)
    expect(await prisma.listingEdit.count()).toBe(1)
  })

  it('rejects an editor of a different web', async () => {
    await setup()
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const { user } = await createUserWithWebAccess(otherWeb.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await rejectEdit('food-hub', 'bristol')

    expect(response.status).toBe(403)
    expect(await prisma.listingEdit.count()).toBe(1)
  })

  it('lets an editor of the web reject it', async () => {
    const { web } = await setup()
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await rejectEdit('food-hub', 'bristol')

    expect(response.status).toBe(200)
    expect(await prisma.listingEdit.count()).toBe(0)
  })

  it('lets a global admin reject it', async () => {
    await setup()
    const admin = await createUser({ role: 'admin' })
    signInAs({ id: admin.id, email: admin.email, role: 'admin' })

    const response = await rejectEdit('food-hub', 'bristol')

    expect(response.status).toBe(200)
    expect(await prisma.listingEdit.count()).toBe(0)
  })
})

describe('POST /api/listings/[slug]/edit', () => {
  const propose = (
    slug: string,
    webSlug: string,
    fields: { listingId: number; category: number; tags: number[] },
  ) => {
    const form = new FormData()
    form.set('listingId', String(fields.listingId))
    form.set('title', 'Proposed title')
    form.set('category', String(fields.category))
    form.set('tags', JSON.stringify(fields.tags))
    form.set('noPhysicalLocation', 'true')
    return POST(
      request(`/api/listings/${slug}/edit?web=${webSlug}`, {
        method: 'POST',
        body: form,
      }),
      params({ slug }),
    )
  }

  it('lets two pending proposals in the same web both keep a tag they picked', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const category = await createCategory(web.id)
    const free = await createTag(web.id, { label: 'Free' })
    const foodHub = await createListing(web.id, { slug: 'food-hub' })
    const bikeKitchen = await createListing(web.id, { slug: 'bike-kitchen' })

    const first = await createUser()
    signInAs({ id: first.id, email: first.email })
    expect(
      (
        await propose('food-hub', 'bristol', {
          listingId: foodHub.id,
          category: category.id,
          tags: [free.id],
        })
      ).status,
    ).toBe(201)

    const second = await createUser()
    signInAs({ id: second.id, email: second.email })
    expect(
      (
        await propose('bike-kitchen', 'bristol', {
          listingId: bikeKitchen.id,
          category: category.id,
          tags: [free.id],
        })
      ).status,
    ).toBe(201)

    const edits = await prisma.listingEdit.findMany({
      include: { tags: true },
      orderBy: { id: 'asc' },
    })
    expect(edits.map((edit) => edit.tags.map((t) => t.label))).toEqual([
      ['Free'],
      ['Free'],
    ])
  })
})
