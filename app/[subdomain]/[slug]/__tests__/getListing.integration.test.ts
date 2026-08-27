import { createCategory, createListing, createWeb } from '@/test/factories'
import { describe, expect, it } from 'vitest'
import prisma from '@prisma-rw'
import getListing from '../getListing.ts'

describe('getListing', () => {
  it('finds the listing in the web it was asked for', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const category = await createCategory(web.id)
    await createListing(web.id, {
      title: 'Food Hub',
      slug: 'food-hub',
      categoryId: category.id,
    })

    const listing = await getListing({
      webSlug: 'bristol',
      listingSlug: 'food-hub',
    })

    expect(listing?.title).toBe('Food Hub')
  })

  /**
   * The web lookup used to be `slug: { contains: webSlug }`, so asking bristol
   * for a slug it doesn't have was answered by any web whose slug contains
   * "bristol" — here, bristol-north's listing of the same name.
   */
  it('does not answer with a listing from a web whose slug merely contains it', async () => {
    await createWeb({ slug: 'bristol' })
    const north = await createWeb({ slug: 'bristol-north' })
    const category = await createCategory(north.id)
    await createListing(north.id, {
      title: 'Food Hub',
      slug: 'food-hub',
      categoryId: category.id,
    })

    const listing = await getListing({
      webSlug: 'bristol',
      listingSlug: 'food-hub',
    })

    expect(listing).toBeNull()
  })

  it('only surfaces relations that also live in the requested web', async () => {
    const bristol = await createWeb({ slug: 'bristol' })
    const category = await createCategory(bristol.id)
    const hub = await createListing(bristol.id, {
      title: 'Food Hub',
      slug: 'food-hub',
      categoryId: category.id,
    })
    const elsewhere = await createWeb({ slug: 'bristol-north' })
    const elsewhereCategory = await createCategory(elsewhere.id)
    const neighbour = await createListing(elsewhere.id, {
      title: 'Neighbour',
      slug: 'neighbour',
      categoryId: elsewhereCategory.id,
    })

    await prisma.listing.update({
      where: { id: hub.id },
      data: { relations: { connect: { id: neighbour.id } } },
    })

    const listing = await getListing({
      webSlug: 'bristol',
      listingSlug: 'food-hub',
    })

    expect(listing?.relations).toEqual([])
  })
})
