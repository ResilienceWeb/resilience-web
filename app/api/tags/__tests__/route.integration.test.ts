import {
  createListing,
  createTag,
  createUser,
  createUserWithWebAccess,
  createWeb,
} from '@/test/factories'
import { params, request } from '@/test/http'
import { signInAs } from '@/test/session'
import { WebRole } from '@prisma-client'
import { describe, expect, it } from 'vitest'
import prisma from '@prisma-rw'
import { PUT as putTagListings } from '../[id]/listings/route.ts'
import { DELETE as deleteTag, PATCH as patchTag } from '../[id]/route.ts'
import { GET as getTags, POST as postTag } from '../route.ts'

const asEditorOf = async (webId: number) => {
  const { user } = await createUserWithWebAccess(webId, WebRole.EDITOR)
  signInAs({ id: user.id, email: user.email })
  return user
}

describe('POST /api/tags', () => {
  it('rejects an anonymous caller', async () => {
    const web = await createWeb({ slug: 'bristol' })

    const response = await postTag(
      request('/api/tags', {
        method: 'POST',
        body: { label: 'Volunteer-run', webId: web.id },
      }),
    )

    expect(response.status).toBe(403)
    expect(await prisma.tag.count()).toBe(0)
  })

  it('rejects an editor of a different web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    await asEditorOf(otherWeb.id)

    const response = await postTag(
      request('/api/tags', {
        method: 'POST',
        body: { label: 'Volunteer-run', webId: web.id },
      }),
    )

    expect(response.status).toBe(403)
    expect(await prisma.tag.count()).toBe(0)
  })

  it('lets an editor of the web create one', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await asEditorOf(web.id)

    const response = await postTag(
      request('/api/tags', {
        method: 'POST',
        body: { label: 'Volunteer-run', webId: web.id },
      }),
    )

    expect(response.status).toBe(200)
    expect(
      (await prisma.tag.findFirst({ where: { webId: web.id } }))?.label,
    ).toBe('Volunteer-run')
  })
})

describe('PATCH /api/tags/[id]', () => {
  it('rejects an editor of a different web and leaves the label alone', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const tag = await createTag(web.id, { label: 'Volunteer-run' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    await asEditorOf(otherWeb.id)

    const response = await patchTag(
      request(`/api/tags/${tag.id}`, {
        method: 'PATCH',
        body: { label: 'Hijacked' },
      }),
      params({ id: String(tag.id) }),
    )

    expect(response.status).toBe(403)
    expect(
      (await prisma.tag.findUnique({ where: { id: tag.id } }))?.label,
    ).toBe('Volunteer-run')
  })

  it('cannot be used to move a tag into another web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const tag = await createTag(web.id)
    await asEditorOf(web.id)

    await patchTag(
      request(`/api/tags/${tag.id}`, {
        method: 'PATCH',
        body: { label: 'Renamed', webId: otherWeb.id },
      }),
      params({ id: String(tag.id) }),
    )

    expect(
      (await prisma.tag.findUnique({ where: { id: tag.id } }))?.webId,
    ).toBe(web.id)
  })

  it('lets a global admin rename any web tag', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const tag = await createTag(web.id, { label: 'Volunteer-run' })
    const admin = await createUser({ role: 'admin' })
    signInAs({ id: admin.id, email: admin.email, role: 'admin' })

    const response = await patchTag(
      request(`/api/tags/${tag.id}`, {
        method: 'PATCH',
        body: { label: 'Volunteer led' },
      }),
      params({ id: String(tag.id) }),
    )

    expect(response.status).toBe(200)
    expect(
      (await prisma.tag.findUnique({ where: { id: tag.id } }))?.label,
    ).toBe('Volunteer led')
  })
})

describe('DELETE /api/tags/[id]', () => {
  it('rejects an anonymous caller and keeps the tag', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const tag = await createTag(web.id)

    const response = await deleteTag(
      request(`/api/tags/${tag.id}`, { method: 'DELETE' }),
      params({ id: String(tag.id) }),
    )

    expect(response.status).toBe(403)
    expect(await prisma.tag.count()).toBe(1)
  })

  it('lets an editor of the web delete it', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const tag = await createTag(web.id)
    await asEditorOf(web.id)

    const response = await deleteTag(
      request(`/api/tags/${tag.id}`, { method: 'DELETE' }),
      params({ id: String(tag.id) }),
    )

    expect(response.status).toBe(200)
    expect(await prisma.tag.count()).toBe(0)
  })
})

describe('PUT /api/tags/[id]/listings', () => {
  const putListings = (tagId: number, body: Record<string, unknown>) =>
    putTagListings(
      request(`/api/tags/${tagId}/listings`, { method: 'PUT', body }),
      params({ id: String(tagId) }),
    )

  it('rejects an editor of a different web and leaves the listing untagged', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const tag = await createTag(web.id)
    const listing = await createListing(web.id)
    const placementId = listing.placements[0]?.id
    const otherWeb = await createWeb({ slug: 'cambridge' })
    await asEditorOf(otherWeb.id)

    const response = await putListings(tag.id, {
      addedListingIds: [placementId],
      removedListingIds: [],
    })

    expect(response.status).toBe(403)
    expect(
      await prisma.tag.findUnique({
        where: { id: tag.id },
        include: { listings: true },
      }),
    ).toMatchObject({ listings: [] })
  })

  it('tags the placements in its own web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const tag = await createTag(web.id)
    const listing = await createListing(web.id)
    const placementId = listing.placements[0]?.id
    await asEditorOf(web.id)

    const response = await putListings(tag.id, {
      addedListingIds: [placementId],
      removedListingIds: [],
    })

    expect(response.status).toBe(200)
    const tagged = await prisma.tag.findUnique({
      where: { id: tag.id },
      include: { listings: { select: { id: true } } },
    })
    expect(tagged?.listings.map((l) => l.id)).toEqual([placementId])
  })

  it('ignores placements that belong to another web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const tag = await createTag(web.id)
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const theirListing = await createListing(otherWeb.id)
    const theirPlacementId = theirListing.placements[0]?.id
    await asEditorOf(web.id)

    const response = await putListings(tag.id, {
      addedListingIds: [theirPlacementId],
      removedListingIds: [],
    })

    expect(response.status).toBe(200)
    const tagged = await prisma.tag.findUnique({
      where: { id: tag.id },
      include: { listings: true },
    })
    expect(tagged?.listings).toEqual([])
  })
})

describe('a tag icon', () => {
  it('is saved with a new tag', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await asEditorOf(web.id)

    const response = await postTag(
      request('/api/tags', {
        method: 'POST',
        body: { label: 'Food aid', icon: 'gm:food-bank', webId: web.id },
      }),
    )

    expect(response.status).toBe(200)
    expect(
      (await prisma.tag.findFirst({ where: { webId: web.id } }))?.icon,
    ).toBe('gm:food-bank')
  })

  it('is optional', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await asEditorOf(web.id)

    await postTag(
      request('/api/tags', {
        method: 'POST',
        body: { label: 'Free', webId: web.id },
      }),
    )

    expect(
      (await prisma.tag.findFirst({ where: { webId: web.id } }))?.icon,
    ).toBeNull()
  })

  it('must be one the icon picker offers', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await asEditorOf(web.id)

    const response = await postTag(
      request('/api/tags', {
        method: 'POST',
        body: { label: 'Free', icon: '<script>', webId: web.id },
      }),
    )

    expect(response.status).toBe(400)
    expect(await prisma.tag.count()).toBe(0)
  })

  it('can be changed and removed without touching the label', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const tag = await createTag(web.id, { label: 'Food aid', icon: 'Leaf' })
    await asEditorOf(web.id)

    const patch = (body: object) =>
      patchTag(
        request(`/api/tags/${tag.id}`, { method: 'PATCH', body }),
        params({ id: String(tag.id) }),
      )
    const saved = () => prisma.tag.findUnique({ where: { id: tag.id } })

    await patch({ icon: 'gm:food-bank' })
    expect(await saved()).toMatchObject({
      label: 'Food aid',
      icon: 'gm:food-bank',
    })

    await patch({ icon: null })
    expect((await saved())?.icon).toBeNull()

    expect((await patch({ icon: 'gm:nope' })).status).toBe(400)
  })

  it('comes back with the web tags', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await createTag(web.id, { icon: 'gm:food-bank' })

    const response = await getTags(request('/api/tags?web=bristol'))

    expect((await response.json()).data[0].icon).toBe('gm:food-bank')
  })
})
