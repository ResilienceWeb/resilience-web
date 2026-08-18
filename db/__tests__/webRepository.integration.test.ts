import { describe, expect, it } from 'vitest'
import prisma from '@prisma-rw'
import {
  createCategory,
  createListing,
  createWeb,
} from '../../test/factories/index.ts'
import {
  deleteWebBySlug,
  getWebById,
  softDeleteWebBySlug,
} from '../webRepository.ts'

/**
 * Only the parts of this repository that carry logic of their own. The plain
 * soft-delete-aware lookups are exercised through the API routes that use
 * them, where a failure means something a user would actually notice.
 */

describe('getWebById', () => {
  it('counts only the listings placed in that web', async () => {
    const web = await createWeb()
    const otherWeb = await createWeb()
    await createListing(web.id)
    await createListing(web.id)
    await createListing(otherWeb.id)

    expect((await getWebById(web.id))?._count.listings).toBe(2)
  })
})

describe('softDeleteWebBySlug', () => {
  it('stamps deletedAt without removing the row or its listings', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await createListing(web.id)

    await softDeleteWebBySlug('bristol')

    const row = await prisma.web.findUnique({ where: { slug: 'bristol' } })
    expect(row?.deletedAt).toBeInstanceOf(Date)
    expect(
      await prisma.listingPlacement.count({ where: { webId: web.id } }),
    ).toBe(1)
  })
})

describe('deleteWebBySlug', () => {
  it('removes the web, its categories and its listings', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const category = await createCategory(web.id)
    await createListing(web.id, { categoryId: category.id })

    await deleteWebBySlug('bristol')

    expect(await prisma.web.count()).toBe(0)
    expect(await prisma.category.count()).toBe(0)
    expect(await prisma.listing.count()).toBe(0)
  })

  it('keeps listings that are also placed in another web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb()
    const shared = await createListing(web.id)
    await prisma.listingPlacement.create({
      data: { listingId: shared.id, webId: otherWeb.id, slug: 'shared' },
    })

    await deleteWebBySlug('bristol')

    expect(
      await prisma.listing.findUnique({ where: { id: shared.id } }),
    ).not.toBeNull()
    expect(
      await prisma.listingPlacement.count({ where: { listingId: shared.id } }),
    ).toBe(1)
  })

  it('throws when the web does not exist', async () => {
    await expect(deleteWebBySlug('nope')).rejects.toThrow('Web not found')
  })
})
