import { createCategory, createListing, createWeb } from '@/test/factories'
import { describe, expect, it } from 'vitest'
import prisma from '@prisma-rw'
import { GET } from '../route'

async function sitemapListings() {
  const response = await GET()
  const { listings } = await response.json()
  return listings.map((l) => `${l.web.slug}/${l.slug}`).sort()
}

const indexable = { image: 'https://example.com/hub.png', description: 'Hub' }

describe('GET /api/listings/for-sitemap', () => {
  it('lists a shared listing once, at its canonical page', async () => {
    const bristol = await createWeb({ slug: 'bristol' })
    const hub = await createListing(bristol.id, {
      slug: 'food-hub',
      categoryId: (await createCategory(bristol.id)).id,
    })
    await prisma.listing.update({ where: { id: hub.id }, data: indexable })
    const bath = await createWeb({ slug: 'bath' })
    await prisma.listingPlacement.create({
      data: {
        listingId: hub.id,
        webId: bath.id,
        slug: 'hub-in-bath',
        categoryId: (await createCategory(bath.id)).id,
      },
    })

    expect(await sitemapListings()).toEqual(['bristol/food-hub'])
  })

  it('leaves out placements without a category, whose pages 404', async () => {
    const bristol = await createWeb({ slug: 'bristol' })
    const hub = await createListing(bristol.id, { slug: 'food-hub' })
    await prisma.listing.update({ where: { id: hub.id }, data: indexable })

    expect(await sitemapListings()).toEqual([])
  })
})
