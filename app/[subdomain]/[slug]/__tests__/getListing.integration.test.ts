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

  it('lists the other published webs the listing is placed in', async () => {
    const bristol = await createWeb({ slug: 'bristol', title: 'Bristol' })
    const hub = await createListing(bristol.id, {
      slug: 'food-hub',
      categoryId: (await createCategory(bristol.id)).id,
    })

    const place = async (
      web: { slug: string; title: string; published?: boolean },
      categorised = true,
    ) => {
      const created = await createWeb(web)
      await prisma.listingPlacement.create({
        data: {
          listingId: hub.id,
          webId: created.id,
          slug: `hub-in-${web.slug}`,
          categoryId: categorised
            ? (await createCategory(created.id)).id
            : undefined,
        },
      })
    }
    await place({ slug: 'cardiff', title: 'Cardiff' })
    await place({ slug: 'bath', title: 'Bath' })
    await place({ slug: 'leeds', title: 'Leeds', published: false })
    await place({ slug: 'york', title: 'York' }, false)

    const listing = await getListing({
      webSlug: 'bristol',
      listingSlug: 'food-hub',
    })

    expect(listing?.alsoListedIn).toEqual([
      { slug: 'hub-in-bath', web: { slug: 'bath', title: 'Bath' } },
      { slug: 'hub-in-cardiff', web: { slug: 'cardiff', title: 'Cardiff' } },
    ])
  })

  describe('canonical URL', () => {
    async function shareInto(
      listingId: number,
      web: Parameters<typeof createWeb>[0],
      { categorised = true } = {},
    ) {
      const created = await createWeb(web)
      await prisma.listingPlacement.create({
        data: {
          listingId,
          webId: created.id,
          slug: `hub-in-${created.slug}`,
          categoryId: categorised
            ? (await createCategory(created.id)).id
            : undefined,
        },
      })
    }

    async function createHubInBristol() {
      const bristol = await createWeb({ slug: 'bristol' })
      return createListing(bristol.id, {
        slug: 'food-hub',
        categoryId: (await createCategory(bristol.id)).id,
      })
    }

    it('points every copy of a shared listing at the web it was first placed in', async () => {
      const hub = await createHubInBristol()
      await shareInto(hub.id, { slug: 'bath' })

      const inBristol = await getListing({
        webSlug: 'bristol',
        listingSlug: 'food-hub',
      })
      const inBath = await getListing({
        webSlug: 'bath',
        listingSlug: 'hub-in-bath',
      })

      expect(inBristol?.canonicalUrl).toBe(
        'https://bristol.resilienceweb.org.uk/food-hub',
      )
      expect(inBath?.canonicalUrl).toBe(
        'https://bristol.resilienceweb.org.uk/food-hub',
      )
    })

    it('passes over a first placement that visitors cannot reach', async () => {
      const hub = await createHubInBristol()
      await prisma.web.update({
        where: { slug: 'bristol' },
        data: { published: false },
      })
      await shareInto(hub.id, { slug: 'york' }, { categorised: false })
      await shareInto(hub.id, { slug: 'bath' })
      await shareInto(hub.id, { slug: 'cardiff' })

      const listing = await getListing({
        webSlug: 'cardiff',
        listingSlug: 'hub-in-cardiff',
      })

      expect(listing?.canonicalUrl).toBe(
        'https://bath.resilienceweb.org.uk/hub-in-bath',
      )
    })

    it('falls back to the page itself when no placement is reachable', async () => {
      await createHubInBristol()
      await prisma.web.update({
        where: { slug: 'bristol' },
        data: { published: false },
      })

      const listing = await getListing({
        webSlug: 'bristol',
        listingSlug: 'food-hub',
      })

      expect(listing?.canonicalUrl).toBe(
        'https://bristol.resilienceweb.org.uk/food-hub',
      )
    })
  })
})
