import {
  createListing,
  createListingEdit,
  createSharedTag,
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
import {
  findWebTagsDuplicatingSharedTags,
  mergeWebTagsIntoSharedTags,
} from '@db/sharedTagCleanup'
import {
  DELETE as removeTagFromWeb,
  PUT as putTagListings,
} from '../[id]/listings/route.ts'
import { DELETE as deleteTag, PATCH as patchTag } from '../[id]/route.ts'
import { GET as getTags, POST as postTag } from '../route.ts'

/**
 * Shared tags are one row with no web, used by listings in every web (see
 * docs/adr/0001-shared-tags-are-one-row-across-webs.md). No web may change
 * them, and each web only ever touches its own listings' use of them.
 */

const asEditorOf = async (webId: number) => {
  const { user } = await createUserWithWebAccess(webId, WebRole.EDITOR)
  signInAs({ id: user.id, email: user.email })
  return user
}

const putListings = (tagId: number, body: Record<string, unknown>) =>
  putTagListings(
    request(`/api/tags/${tagId}/listings`, { method: 'PUT', body }),
    params({ id: String(tagId) }),
  )

const placementIdsTagged = async (tagId: number) =>
  (
    await prisma.listingPlacement.findMany({
      where: { tags: { some: { id: tagId } } },
      select: { id: true },
      orderBy: { id: 'asc' },
    })
  ).map((p) => p.id)

describe('a shared tag', () => {
  it('can be used in two webs, and found in both by its key', async () => {
    const foodBank = await createSharedTag({
      key: 'food-bank',
      label: 'Food Bank',
    })
    const bristol = await createWeb({ slug: 'bristol' })
    const cambridge = await createWeb({ slug: 'cambridge' })
    const inBristol = await createListing(bristol.id)
    const inCambridge = await createListing(cambridge.id)

    await asEditorOf(bristol.id)
    await putListings(foodBank.id, {
      webId: bristol.id,
      addedListingIds: [inBristol.placements[0]?.id],
    })
    await asEditorOf(cambridge.id)
    await putListings(foodBank.id, {
      webId: cambridge.id,
      addedListingIds: [inCambridge.placements[0]?.id],
    })

    const tagged = await prisma.listingPlacement.findMany({
      where: { tags: { some: { key: 'food-bank' } } },
      select: { listingId: true, webId: true },
      orderBy: { id: 'asc' },
    })
    expect(tagged).toEqual([
      { listingId: inBristol.id, webId: bristol.id },
      { listingId: inCambridge.id, webId: cambridge.id },
    ])
  })
})

describe('GET /api/tags', () => {
  it("offers a web its own tags and every shared tag, counting only that web's listings", async () => {
    const bristol = await createWeb({ slug: 'bristol' })
    const cambridge = await createWeb({ slug: 'cambridge' })
    const free = await createSharedTag({ label: 'Free' })
    await createSharedTag({ label: 'Cycling' })
    await createTag(bristol.id, { label: 'Bristol only' })
    await createTag(cambridge.id, { label: 'Cambridge only' })
    await createListing(bristol.id, { tagIds: [free.id] })
    await createListing(cambridge.id, { tagIds: [free.id] })
    await createListing(cambridge.id, { tagIds: [free.id] })

    const response = await getTags(request('/api/tags?web=bristol'))
    const tags = (await response.json()).data

    expect(tags.map((t) => [t.label, t._count.listings]).sort()).toEqual([
      ['Bristol only', 0],
      ['Cycling', 0],
      ['Free', 1],
    ])
  })

  it('leaves out a retired shared tag, unless the web still uses it', async () => {
    const bristol = await createWeb({ slug: 'bristol' })
    await createWeb({ slug: 'cambridge' })
    const retired = await createSharedTag({
      label: 'Retired',
      retiredAt: new Date(),
    })
    await createListing(bristol.id, { tagIds: [retired.id] })

    const labels = async (web: string) =>
      (await (await getTags(request(`/api/tags?web=${web}`))).json()).data.map(
        (t) => t.label,
      )

    expect(await labels('bristol')).toEqual(['Retired'])
    expect(await labels('cambridge')).toEqual([])
  })
})

describe('web editors', () => {
  it('cannot rename or re-icon a shared tag', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const tag = await createSharedTag({ label: 'Free', icon: 'Gift' })
    await asEditorOf(web.id)

    const response = await patchTag(
      request(`/api/tags/${tag.id}`, {
        method: 'PATCH',
        body: { label: 'Gratis', icon: 'Leaf', webId: web.id },
      }),
      params({ id: String(tag.id) }),
    )

    expect(response.status).toBe(403)
    expect(
      await prisma.tag.findUnique({ where: { id: tag.id } }),
    ).toMatchObject({ label: 'Free', icon: 'Gift', webId: null })
  })

  it('cannot delete a shared tag, even as a global admin', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const tag = await createSharedTag()
    await createListing(web.id, { tagIds: [tag.id] })
    const admin = await createUser({ role: 'admin' })
    signInAs({ id: admin.id, email: admin.email, role: 'admin' })

    const response = await deleteTag(
      request(`/api/tags/${tag.id}`, { method: 'DELETE' }),
      params({ id: String(tag.id) }),
    )

    expect(response.status).toBe(403)
    expect(await placementIdsTagged(tag.id)).toHaveLength(1)
  })

  it.each(['Free', ' free '])(
    'cannot create a web tag named %j when that is a shared tag',
    async (label) => {
      const web = await createWeb({ slug: 'bristol' })
      await createSharedTag({ label: 'Free' })
      await asEditorOf(web.id)

      const response = await postTag(
        request('/api/tags', {
          method: 'POST',
          body: { label, webId: web.id },
        }),
      )

      expect(response.status).toBe(409)
      expect(await prisma.tag.count({ where: { webId: web.id } })).toBe(0)
    },
  )

  it('cannot rename a web tag to a shared tag', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await createSharedTag({ label: 'Free' })
    const tag = await createTag(web.id, { label: 'No charge' })
    await asEditorOf(web.id)

    const response = await patchTag(
      request(`/api/tags/${tag.id}`, {
        method: 'PATCH',
        body: { label: 'FREE' },
      }),
      params({ id: String(tag.id) }),
    )

    expect(response.status).toBe(409)
    expect(
      (await prisma.tag.findUnique({ where: { id: tag.id } }))?.label,
    ).toBe('No charge')
  })
})

describe('PUT /api/tags/[id]/listings for a shared tag', () => {
  it('needs to be told which web it is changing', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const tag = await createSharedTag()
    const listing = await createListing(web.id)
    await asEditorOf(web.id)

    const response = await putListings(tag.id, {
      addedListingIds: [listing.placements[0]?.id],
    })

    expect(response.status).toBe(400)
    expect(await placementIdsTagged(tag.id)).toEqual([])
  })

  it('rejects an editor of a different web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const tag = await createSharedTag()
    const listing = await createListing(web.id)
    await asEditorOf(otherWeb.id)

    const response = await putListings(tag.id, {
      webId: web.id,
      addedListingIds: [listing.placements[0]?.id],
    })

    expect(response.status).toBe(403)
    expect(await placementIdsTagged(tag.id)).toEqual([])
  })

  it('only reaches placements in the web it was told', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const tag = await createSharedTag()
    const theirs = await createListing(otherWeb.id)
    await asEditorOf(web.id)

    await putListings(tag.id, {
      webId: web.id,
      addedListingIds: [theirs.placements[0]?.id],
    })

    expect(await placementIdsTagged(tag.id)).toEqual([])
  })

  it('will not add a retired one, but will take it off', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const tag = await createSharedTag({ retiredAt: new Date() })
    const tagged = await createListing(web.id, { tagIds: [tag.id] })
    const untagged = await createListing(web.id)
    await asEditorOf(web.id)

    await putListings(tag.id, {
      webId: web.id,
      addedListingIds: [untagged.placements[0]?.id],
    })
    expect(await placementIdsTagged(tag.id)).toEqual([tagged.placements[0]?.id])

    await putListings(tag.id, {
      webId: web.id,
      removedListingIds: [tagged.placements[0]?.id],
    })
    expect(await placementIdsTagged(tag.id)).toEqual([])
  })
})

describe('DELETE /api/tags/[id]/listings', () => {
  const removeFromWeb = (tagId: number, webId: number) =>
    removeTagFromWeb(
      request(`/api/tags/${tagId}/listings`, {
        method: 'DELETE',
        body: { webId },
      }),
      params({ id: String(tagId) }),
    )

  it("takes a shared tag off this web's listings and leaves other webs alone", async () => {
    const bristol = await createWeb({ slug: 'bristol' })
    const cambridge = await createWeb({ slug: 'cambridge' })
    const tag = await createSharedTag()
    await createListing(bristol.id, { tagIds: [tag.id] })
    await createListing(bristol.id, { tagIds: [tag.id] })
    const theirs = await createListing(cambridge.id, { tagIds: [tag.id] })
    await asEditorOf(bristol.id)

    const response = await removeFromWeb(tag.id, bristol.id)

    expect(response.status).toBe(200)
    expect(await placementIdsTagged(tag.id)).toEqual([theirs.placements[0]?.id])
    expect(await prisma.tag.findUnique({ where: { id: tag.id } })).not.toBe(
      null,
    )
  })

  it('rejects an editor of a different web', async () => {
    const bristol = await createWeb({ slug: 'bristol' })
    const cambridge = await createWeb({ slug: 'cambridge' })
    const tag = await createSharedTag()
    await createListing(bristol.id, { tagIds: [tag.id] })
    await asEditorOf(cambridge.id)

    const response = await removeFromWeb(tag.id, bristol.id)

    expect(response.status).toBe(403)
    expect(await placementIdsTagged(tag.id)).toHaveLength(1)
  })
})

describe('merging web tags into shared tags', () => {
  const setUp = async () => {
    const bristol = await createWeb({ slug: 'bristol' })
    const cambridge = await createWeb({ slug: 'cambridge' })
    const free = await createSharedTag({ key: 'free', label: 'Free' })
    await createSharedTag({ key: 'repair-cafe', label: 'Repair Café' })
    const bristolFree = await createTag(bristol.id, { label: 'free ' })
    const cambridgeFree = await createTag(cambridge.id, { label: 'FREE' })
    // Close, but not the same name: left alone
    const repairCafe = await createTag(bristol.id, { label: 'Repair Cafe' })
    const listing = await createListing(bristol.id, {
      tagIds: [bristolFree.id, repairCafe.id],
    })
    const theirs = await createListing(cambridge.id, {
      tagIds: [cambridgeFree.id],
    })
    const proposer = await createUser()
    const edit = await createListingEdit(bristol.id, listing.id, proposer.id, {
      tagIds: [bristolFree.id],
    })
    return { free, repairCafe, listing, theirs, edit }
  }

  it('reports the duplicates without changing anything', async () => {
    await setUp()
    const before = await prisma.tag.findMany({
      include: { listings: true, listingEdits: true },
      orderBy: { id: 'asc' },
    })

    const duplicates = await findWebTagsDuplicatingSharedTags(prisma)

    expect(
      duplicates.map((d) => [d.webSlug, d.webTag.label, d.placementIds.length]),
    ).toEqual([
      ['bristol', 'free ', 1],
      ['cambridge', 'FREE', 1],
    ])
    expect(
      await prisma.tag.findMany({
        include: { listings: true, listingEdits: true },
        orderBy: { id: 'asc' },
      }),
    ).toEqual(before)
  })

  it('moves listings and pending edits to the shared tag, leaving no duplicate', async () => {
    const { free, repairCafe, listing, theirs, edit } = await setUp()

    await mergeWebTagsIntoSharedTags(
      prisma,
      await findWebTagsDuplicatingSharedTags(prisma),
    )

    expect(await findWebTagsDuplicatingSharedTags(prisma)).toEqual([])
    expect(await placementIdsTagged(free.id)).toEqual([
      listing.placements[0]?.id,
      theirs.placements[0]?.id,
    ])
    expect(
      (
        await prisma.listingEdit.findUnique({
          where: { id: edit.id },
          include: { tags: true },
        })
      )?.tags.map((t) => t.id),
    ).toEqual([free.id])
    expect(await placementIdsTagged(repairCafe.id)).toEqual([
      listing.placements[0]?.id,
    ])
  })
})
