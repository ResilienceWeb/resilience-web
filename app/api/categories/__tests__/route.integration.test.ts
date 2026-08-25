import {
  createCategory,
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
import { GET as getTags } from '../../tags/route.ts'
import {
  DELETE as deleteCategory,
  PATCH as patchCategory,
} from '../[id]/route.ts'
import { GET as getCategories, POST as postCategory } from '../route.ts'

const json = async (response: Response) =>
  (await response.json()) as { data: any[] }

describe('GET /api/categories', () => {
  it('returns an empty list when no web is given', async () => {
    await createWeb({ slug: 'bristol' })

    expect(await json(await getCategories(request('/api/categories')))).toEqual(
      {
        data: [],
      },
    )
  })

  it('returns only the requested web categories', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const mine = await createCategory(web.id, { label: 'Housing' })
    await createCategory(otherWeb.id, { label: 'Transport' })

    const { data } = await json(
      await getCategories(request('/api/categories?web=bristol')),
    )

    expect(data.map((c) => c.id)).toEqual([mine.id])
  })

  it('counts only listings placed in that web', async () => {
    // Regression guard: the count used to aggregate every web listing_placements
    // row, so a category shared across webs reported the global total.
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const category = await createCategory(web.id, { label: 'Housing' })

    await createListing(web.id, { categoryId: category.id })
    await createListing(web.id, { categoryId: category.id })
    // Same category, placed in a different web.
    const shared = await createListing(otherWeb.id)
    await prisma.listingPlacement.update({
      where: {
        listingPlacementPair: { listingId: shared.id, webId: otherWeb.id },
      },
      data: { categoryId: category.id },
    })

    const { data } = await json(
      await getCategories(request('/api/categories?web=bristol')),
    )

    expect(data[0]._count.listings).toBe(2)
  })

  it('returns an empty list for a soft-deleted web', async () => {
    const web = await createWeb({ slug: 'bristol', deletedAt: new Date() })
    await createCategory(web.id)

    expect(
      await json(await getCategories(request('/api/categories?web=bristol'))),
    ).toEqual({ data: [] })
  })

  it('returns an empty list for an unknown web', async () => {
    expect(
      await json(await getCategories(request('/api/categories?web=nope'))),
    ).toEqual({ data: [] })
  })
})

const createRequest = (body: Record<string, unknown>) =>
  request('/api/categories', { method: 'POST', body })

describe('POST /api/categories', () => {
  it('creates a category on the web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await postCategory(
      createRequest({
        label: 'Housing',
        color: 'cb6ce6',
        icon: 'Home',
        webId: web.id,
      }),
    )

    expect(response.status).toBe(200)
    const created = await prisma.category.findFirst({
      where: { webId: web.id },
    })
    expect(created?.label).toBe('Housing')
  })

  it('rejects a duplicate label within the same web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await createCategory(web.id, { label: 'Housing' })
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await postCategory(
      createRequest({ label: 'Housing', webId: web.id }),
    )

    expect(response.status).toBe(500)
    expect(await prisma.category.count({ where: { webId: web.id } })).toBe(1)
  })

  it('rejects an anonymous caller', async () => {
    const web = await createWeb({ slug: 'bristol' })

    const response = await postCategory(
      createRequest({ label: 'Housing', webId: web.id }),
    )

    expect(response.status).toBe(403)
    expect(await prisma.category.count()).toBe(0)
  })

  it('rejects an editor of a different web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const { user } = await createUserWithWebAccess(otherWeb.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await postCategory(
      createRequest({ label: 'Housing', webId: web.id }),
    )

    expect(response.status).toBe(403)
    expect(await prisma.category.count()).toBe(0)
  })

  it('allows a global admin without web access', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const admin = await createUser({ role: 'admin' })
    signInAs({ id: admin.id, email: admin.email, role: 'admin' })

    const response = await postCategory(
      createRequest({ label: 'Housing', webId: web.id }),
    )

    expect(response.status).toBe(200)
  })

  it('ignores a webId the caller smuggles alongside extra relation writes', async () => {
    // `data: body` made `listings` a way past the check.
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const theirListing = await createListing(otherWeb.id)
    const theirPlacement = theirListing.placements[0]
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await postCategory(
      createRequest({
        label: 'Housing',
        webId: web.id,
        listings: { connect: [{ id: theirPlacement?.id }] },
      }),
    )

    expect(response.status).toBe(200)
    expect(
      (
        await prisma.listingPlacement.findUnique({
          where: { id: theirPlacement?.id },
        })
      )?.categoryId,
    ).toBeNull()
  })
})

describe('PATCH /api/categories/[id]', () => {
  it('rejects an editor of a different web and leaves the label alone', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const category = await createCategory(web.id, { label: 'Housing' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const { user } = await createUserWithWebAccess(otherWeb.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await patchCategory(
      request(`/api/categories/${category.id}`, {
        method: 'PATCH',
        body: { label: 'Hijacked' },
      }),
      params({ id: String(category.id) }),
    )

    expect(response.status).toBe(403)
    expect(
      (await prisma.category.findUnique({ where: { id: category.id } }))?.label,
    ).toBe('Housing')
  })

  it('lets an editor of the web rename it', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const category = await createCategory(web.id, { label: 'Housing' })
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await patchCategory(
      request(`/api/categories/${category.id}`, {
        method: 'PATCH',
        body: { label: 'Homes', color: 'ff5757' },
      }),
      params({ id: String(category.id) }),
    )

    expect(response.status).toBe(200)
    expect(
      (await prisma.category.findUnique({ where: { id: category.id } }))?.label,
    ).toBe('Homes')
  })

  it('cannot be used to move a category into another web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const category = await createCategory(web.id, { label: 'Housing' })
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    await patchCategory(
      request(`/api/categories/${category.id}`, {
        method: 'PATCH',
        body: { label: 'Housing', webId: otherWeb.id },
      }),
      params({ id: String(category.id) }),
    )

    expect(
      (await prisma.category.findUnique({ where: { id: category.id } }))?.webId,
    ).toBe(web.id)
  })
})

describe('DELETE /api/categories/[id]', () => {
  it('rejects an anonymous caller and keeps the category', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const category = await createCategory(web.id)

    const response = await deleteCategory(
      request(`/api/categories/${category.id}`, { method: 'DELETE' }),
      params({ id: String(category.id) }),
    )

    expect(response.status).toBe(403)
    expect(await prisma.category.count()).toBe(1)
  })

  it('rejects an editor of a different web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const category = await createCategory(web.id)
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const { user } = await createUserWithWebAccess(otherWeb.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await deleteCategory(
      request(`/api/categories/${category.id}`, { method: 'DELETE' }),
      params({ id: String(category.id) }),
    )

    expect(response.status).toBe(403)
    expect(await prisma.category.count()).toBe(1)
  })

  it('lets an editor of the web delete it', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const category = await createCategory(web.id)
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await deleteCategory(
      request(`/api/categories/${category.id}`, { method: 'DELETE' }),
      params({ id: String(category.id) }),
    )

    expect(response.status).toBe(200)
    expect(await prisma.category.count()).toBe(0)
  })
})

describe('GET /api/tags', () => {
  it('counts only listings placed in that web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const tag = await createTag(web.id, { label: 'Volunteer-run' })

    await createListing(web.id, { tagIds: [tag.id] })
    const shared = await createListing(otherWeb.id)
    await prisma.listingPlacement.update({
      where: {
        listingPlacementPair: { listingId: shared.id, webId: otherWeb.id },
      },
      data: { tags: { connect: { id: tag.id } } },
    })

    const { data } = await json(await getTags(request('/api/tags?web=bristol')))

    expect(data).toHaveLength(1)
    expect(data[0]._count.listings).toBe(1)
  })

  it('does not return tags belonging to other webs', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const mine = await createTag(web.id)
    await createTag(otherWeb.id)

    const { data } = await json(await getTags(request('/api/tags?web=bristol')))

    expect(data.map((t) => t.id)).toEqual([mine.id])
  })
})
