import {
  createCategory,
  createListing,
  createTag,
  createWeb,
} from '@/test/factories'
import { request } from '@/test/http'
import { describe, expect, it } from 'vitest'
import prisma from '@prisma-rw'
import { GET as getTags } from '../../tags/route.ts'
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

describe('POST /api/categories', () => {
  it('creates a category on the web', async () => {
    const web = await createWeb({ slug: 'bristol' })

    const response = await postCategory(
      request('/api/categories', {
        method: 'POST',
        body: {
          label: 'Housing',
          color: 'cb6ce6',
          icon: 'Home',
          webId: web.id,
        },
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

    const response = await postCategory(
      request('/api/categories', {
        method: 'POST',
        body: { label: 'Housing', webId: web.id },
      }),
    )

    expect(response.status).toBe(500)
    expect(await prisma.category.count({ where: { webId: web.id } })).toBe(1)
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
