import {
  createCategory,
  createListing,
  createListingEdit,
  createTag,
  createUser,
  createUserWithWebAccess,
  createWeb,
} from '@/test/factories'
import { params, request } from '@/test/http'
import { signInAs, signOut } from '@/test/session'
import { WebRole } from '@prisma-client'
import { describe, expect, it } from 'vitest'
import prisma from '@prisma-rw'
import { sendEmail } from '@helpers/email'
import { GET as getListingEdits } from '../../webs/[slug]/listing-edits/route.ts'
import { POST as applyEdit } from '../[id]/apply-edit/route.ts'

/**
 * A web, a published listing in it, and a member who proposes edits.
 *
 * Signs in as a global admin, so tests about the merge behaviour don't each
 * have to set up permissions. Authorization has its own describe block.
 */
async function scenario() {
  const web = await createWeb({ slug: 'bristol' })
  const listing = await createListing(web.id, {
    slug: 'food-hub',
    title: 'Food Hub',
    description: 'Original description',
  })
  const proposer = await createUser()
  const admin = await createUser({ role: 'admin' })
  signInAs({ id: admin.id, email: admin.email, role: 'admin' })
  return { web, listing, proposer, admin }
}

const apply = (listingId: number, listingEditId: number) =>
  applyEdit(
    request(`/api/listing/${listingId}/apply-edit`, {
      method: 'POST',
      body: { listingEditId },
    }),
    params({ id: String(listingId) }),
  )

describe('POST /api/listing/[id]/apply-edit', () => {
  it('rejects an anonymous caller', async () => {
    const { listing, web, proposer } = await scenario()
    const edit = await createListingEdit(web.id, listing.id, proposer.id)
    signOut()

    expect((await apply(listing.id, edit.id)).status).toBe(401)
    expect(
      (await prisma.listing.findUnique({ where: { id: listing.id } }))?.title,
    ).toBe('Food Hub')
  })

  it('404s when the edit does not exist', async () => {
    const { listing } = await scenario()

    expect((await apply(listing.id, 999_999)).status).toBe(404)
  })

  it('404s when the placement the edit targets has been removed', async () => {
    const { web, listing, proposer } = await scenario()
    const edit = await createListingEdit(web.id, listing.id, proposer.id)
    await prisma.listingPlacement.deleteMany({
      where: { listingId: listing.id },
    })

    const response = await apply(listing.id, edit.id)

    expect(response.status).toBe(404)
    expect(await response.text()).toContain('Placement')
  })

  it('merges the proposed fields into the listing', async () => {
    const { web, listing, proposer } = await scenario()
    const edit = await createListingEdit(web.id, listing.id, proposer.id, {
      title: 'Food Hub Bristol',
      description: 'Updated description',
      website: 'https://foodhub.example.com',
      email: 'hello@foodhub.example.com',
    })

    expect((await apply(listing.id, edit.id)).status).toBe(200)

    expect(
      await prisma.listing.findUnique({ where: { id: listing.id } }),
    ).toMatchObject({
      title: 'Food Hub Bristol',
      description: 'Updated description',
      website: 'https://foodhub.example.com',
      email: 'hello@foodhub.example.com',
    })
  })

  it('replaces social links rather than appending to them', async () => {
    const { web, listing, proposer } = await scenario()
    await prisma.listingSocialMedia.create({
      data: {
        listingId: listing.id,
        platform: 'twitter',
        url: 'https://old.example',
      },
    })
    const edit = await createListingEdit(web.id, listing.id, proposer.id, {
      socials: [{ platform: 'instagram', url: 'https://new.example' }],
    })

    await apply(listing.id, edit.id)

    const socials = await prisma.listingSocialMedia.findMany({
      where: { listingId: listing.id },
    })
    expect(socials).toHaveLength(1)
    expect(socials[0]).toMatchObject({
      platform: 'instagram',
      url: 'https://new.example',
    })
  })

  it('moves the placement into the proposed category', async () => {
    const { web, listing, proposer } = await scenario()
    const original = await createCategory(web.id, { label: 'Community' })
    const proposed = await createCategory(web.id, { label: 'Environment' })
    await prisma.listingPlacement.updateMany({
      where: { listingId: listing.id },
      data: { categoryId: original.id },
    })
    const edit = await createListingEdit(web.id, listing.id, proposer.id, {
      categoryId: proposed.id,
    })

    await apply(listing.id, edit.id)

    const placement = await prisma.listingPlacement.findFirst({
      where: { listingId: listing.id },
    })
    expect(placement?.categoryId).toBe(proposed.id)
  })

  it('sets the proposed tags', async () => {
    const { web, listing, proposer } = await scenario()
    const oldTag = await createTag(web.id, { label: 'Old' })
    const newTag = await createTag(web.id, { label: 'New' })
    await prisma.listingPlacement.updateMany({
      where: { listingId: listing.id },
      data: {},
    })
    const placement = await prisma.listingPlacement.findFirst({
      where: { listingId: listing.id },
    })
    await prisma.listingPlacement.update({
      where: { id: placement.id },
      data: { tags: { connect: { id: oldTag.id } } },
    })

    const edit = await createListingEdit(web.id, listing.id, proposer.id, {
      tagIds: [newTag.id],
    })
    await apply(listing.id, edit.id)

    const updated = await prisma.listingPlacement.findUnique({
      where: { id: placement.id },
      include: { tags: true },
    })
    expect(updated?.tags.map((t) => t.label)).toEqual(['New'])
  })

  it('leaves existing tags alone when the edit carries none', async () => {
    // Legacy edits predate tag support; approving one must not wipe the tags.
    const { web, listing, proposer } = await scenario()
    const tag = await createTag(web.id, { label: 'Volunteer-run' })
    const placement = await prisma.listingPlacement.findFirst({
      where: { listingId: listing.id },
    })
    await prisma.listingPlacement.update({
      where: { id: placement.id },
      data: { tags: { connect: { id: tag.id } } },
    })

    const edit = await createListingEdit(web.id, listing.id, proposer.id)
    await apply(listing.id, edit.id)

    const updated = await prisma.listingPlacement.findUnique({
      where: { id: placement.id },
      include: { tags: true },
    })
    expect(updated?.tags.map((t) => t.label)).toEqual(['Volunteer-run'])
  })

  it('creates a location when the listing had none', async () => {
    const { web, listing, proposer } = await scenario()
    const edit = await createListingEdit(web.id, listing.id, proposer.id, {
      location: { latitude: 51.45, longitude: -2.58, description: 'Bristol' },
    })

    await apply(listing.id, edit.id)

    const updated = await prisma.listing.findUnique({
      where: { id: listing.id },
      include: { location: true },
    })
    expect(updated?.location).toMatchObject({
      latitude: 51.45,
      description: 'Bristol',
    })
  })

  it('updates the existing location in place', async () => {
    const { web, listing, proposer } = await scenario()
    const location = await prisma.listingLocation.create({
      data: { latitude: 0, longitude: 0, description: 'Nowhere' },
    })
    await prisma.listing.update({
      where: { id: listing.id },
      data: { locationId: location.id },
    })
    const edit = await createListingEdit(web.id, listing.id, proposer.id, {
      location: { latitude: 51.45, longitude: -2.58, description: 'Bristol' },
    })

    await apply(listing.id, edit.id)

    expect(await prisma.listingLocation.count()).toBe(2) // the edit keeps its own copy
    expect(
      await prisma.listingLocation.findUnique({ where: { id: location.id } }),
    ).toMatchObject({ latitude: 51.45, description: 'Bristol' })
  })

  it('marks the edit accepted and notifies the proposer', async () => {
    const { web, listing, proposer } = await scenario()
    const edit = await createListingEdit(web.id, listing.id, proposer.id, {
      title: 'Food Hub Bristol',
    })

    await apply(listing.id, edit.id)

    expect(
      (await prisma.listingEdit.findUnique({ where: { id: edit.id } }))
        ?.accepted,
    ).toBe(true)
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: proposer.email }),
    )
  })
})

describe('POST /api/listing/[id]/apply-edit authorization', () => {
  /** A pending edit on `bristol`, proposed by someone with no special rights. */
  async function pendingEdit() {
    const web = await createWeb({ slug: 'bristol' })
    const listing = await createListing(web.id, {
      slug: 'food-hub',
      title: 'Food Hub',
    })
    const proposer = await createUser()
    const edit = await createListingEdit(web.id, listing.id, proposer.id, {
      title: 'Approved title',
    })
    return { web, listing, edit }
  }

  const titleOf = async (id: number) =>
    (await prisma.listing.findUnique({ where: { id } }))?.title

  it('rejects a logged-in user with no access to the web', async () => {
    const { listing, edit } = await pendingEdit()
    const outsider = await createUser()
    signInAs({ id: outsider.id, email: outsider.email })

    const response = await apply(listing.id, edit.id)

    expect(response.status).toBe(403)
    expect(await titleOf(listing.id)).toBe('Food Hub')
    expect(
      (await prisma.listingEdit.findUnique({ where: { id: edit.id } }))
        ?.accepted,
    ).toBe(false)
  })

  it('rejects an editor of a different web', async () => {
    const { listing, edit } = await pendingEdit()
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const { user } = await createUserWithWebAccess(otherWeb.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await apply(listing.id, edit.id)

    expect(response.status).toBe(403)
    expect(await titleOf(listing.id)).toBe('Food Hub')
  })

  it('allows an editor of the web the edit belongs to', async () => {
    const { web, listing, edit } = await pendingEdit()
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    expect((await apply(listing.id, edit.id)).status).toBe(200)
    expect(await titleOf(listing.id)).toBe('Approved title')
  })

  it('allows an owner of the web', async () => {
    const { web, listing, edit } = await pendingEdit()
    const { user } = await createUserWithWebAccess(web.id, WebRole.OWNER)
    signInAs({ id: user.id, email: user.email })

    expect((await apply(listing.id, edit.id)).status).toBe(200)
  })

  it('allows a global admin with no web access', async () => {
    const { listing, edit } = await pendingEdit()
    const admin = await createUser({ role: 'admin' })
    signInAs({ id: admin.id, email: admin.email, role: 'admin' })

    expect((await apply(listing.id, edit.id)).status).toBe(200)
  })

  it('rejects an editor whose web has since been soft-deleted', async () => {
    const { web, listing, edit } = await pendingEdit()
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    await prisma.web.update({
      where: { id: web.id },
      data: { deletedAt: new Date() },
    })
    signInAs({ id: user.id, email: user.email })

    expect((await apply(listing.id, edit.id)).status).toBe(403)
    expect(await titleOf(listing.id)).toBe('Food Hub')
  })
})

describe('GET /api/webs/[slug]/listing-edits', () => {
  it('rejects an anonymous caller', async () => {
    await scenario()
    signOut()

    const response = await getListingEdits(
      request('/api/webs/bristol/listing-edits'),
      params({ slug: 'bristol' }),
    )

    expect(response.status).toBe(403)
  })

  it('lists pending edits and drops them once approved', async () => {
    const { web, listing, proposer } = await scenario()
    const edit = await createListingEdit(web.id, listing.id, proposer.id)

    const pending = await getListingEdits(
      request('/api/webs/bristol/listing-edits'),
      params({ slug: 'bristol' }),
    )
    expect((await pending.json()).listingEdits).toHaveLength(1)

    await apply(listing.id, edit.id)

    const after = await getListingEdits(
      request('/api/webs/bristol/listing-edits'),
      params({ slug: 'bristol' }),
    )
    expect((await after.json()).listingEdits).toHaveLength(0)
  })

  it('can include accepted edits on request', async () => {
    const { web, listing, proposer } = await scenario()
    await createListingEdit(web.id, listing.id, proposer.id, { accepted: true })

    const response = await getListingEdits(
      request('/api/webs/bristol/listing-edits?includeAccepted=true'),
      params({ slug: 'bristol' }),
    )

    expect((await response.json()).listingEdits).toHaveLength(1)
  })

  it('rejects a logged-in user with no access to the web', async () => {
    const { web, listing, proposer } = await scenario()
    await createListingEdit(web.id, listing.id, proposer.id)
    const outsider = await createUser()
    signInAs({ id: outsider.id, email: outsider.email })

    const response = await getListingEdits(
      request('/api/webs/bristol/listing-edits'),
      params({ slug: 'bristol' }),
    )

    expect(response.status).toBe(403)
  })

  it('rejects an editor of a different web', async () => {
    const { web, listing, proposer } = await scenario()
    await createListingEdit(web.id, listing.id, proposer.id)
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const { user } = await createUserWithWebAccess(otherWeb.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await getListingEdits(
      request('/api/webs/bristol/listing-edits'),
      params({ slug: 'bristol' }),
    )

    expect(response.status).toBe(403)
  })

  it('allows an editor of the web to read its queue', async () => {
    const { web, listing, proposer } = await scenario()
    await createListingEdit(web.id, listing.id, proposer.id)
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await getListingEdits(
      request('/api/webs/bristol/listing-edits'),
      params({ slug: 'bristol' }),
    )

    expect(response.status).toBe(200)
    expect((await response.json()).listingEdits).toHaveLength(1)
  })

  it('does not return edits belonging to another web', async () => {
    const { web, listing, proposer } = await scenario()
    await createListingEdit(web.id, listing.id, proposer.id)
    await createWeb({ slug: 'cambridge' })

    const response = await getListingEdits(
      request('/api/webs/cambridge/listing-edits'),
      params({ slug: 'cambridge' }),
    )

    expect((await response.json()).listingEdits).toHaveLength(0)
  })
})
