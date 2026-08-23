import { WebRole } from '@prisma-client'
import prisma from '@prisma-rw'

/**
 * Minimal builders for integration tests. Each one fills in the required
 * columns with something unique so tests only have to state the values they
 * actually care about.
 */

let counter = 0
const uniq = () => `${++counter}-${process.pid}`

export async function createWeb(
  overrides: Partial<{
    title: string
    slug: string
    published: boolean
    deletedAt: Date | null
    description: string
  }> = {},
) {
  const id = uniq()
  return prisma.web.create({
    data: {
      title: `Web ${id}`,
      slug: `web-${id}`,
      published: true,
      ...overrides,
    },
  })
}

export async function createCategory(
  webId: number,
  overrides: Partial<{ label: string; color: string; icon: string }> = {},
) {
  return prisma.category.create({
    data: {
      label: `Category ${uniq()}`,
      webId,
      ...overrides,
    },
  })
}

export async function createTag(
  webId: number,
  overrides: Partial<{ label: string }> = {},
) {
  return prisma.tag.create({
    data: {
      label: `Tag ${uniq()}`,
      webId,
      ...overrides,
    },
  })
}

export async function createUser(
  overrides: Partial<{ email: string; name: string; role: string }> = {},
) {
  const id = uniq()
  return prisma.user.create({
    data: {
      email: `user-${id}@example.com`,
      name: `User ${id}`,
      ...overrides,
    },
  })
}

/**
 * Creates a listing together with its placement in `webId`. Listings are only
 * ever reachable through a placement, so the two always go together.
 */
export async function createListing(
  webId: number,
  overrides: Partial<{
    title: string
    slug: string
    description: string
    website: string
    pending: boolean
    inactive: boolean
    categoryId: number
    tagIds: number[]
    featured: Date | null
  }> = {},
) {
  const id = uniq()
  const { slug, categoryId, tagIds, featured, ...listingFields } = overrides

  return prisma.listing.create({
    data: {
      title: `Listing ${id}`,
      ...listingFields,
      placements: {
        create: {
          webId,
          slug: slug ?? `listing-${id}`,
          categoryId,
          featured,
          ...(tagIds?.length
            ? { tags: { connect: tagIds.map((tagId) => ({ id: tagId })) } }
            : {}),
        },
      },
    },
    include: { placements: true },
  })
}

export async function grantWebAccess(
  email: string,
  webId: number,
  role: WebRole = WebRole.EDITOR,
) {
  return prisma.webAccess.create({ data: { email, webId, role } })
}

/** A user plus their access to `webId`, which is what most permission tests need. */
export async function createUserWithWebAccess(
  webId: number,
  role: WebRole = WebRole.EDITOR,
  overrides: Partial<{ email: string; name: string; role: string }> = {},
) {
  const user = await createUser(overrides)
  const access = await grantWebAccess(user.email, webId, role)
  return { user, access }
}

export async function createListingEdit(
  webId: number,
  listingId: number,
  userId: string,
  overrides: Partial<{
    title: string
    description: string
    website: string
    email: string
    image: string
    slug: string
    accepted: boolean
    categoryId: number
    tagIds: number[]
    socials: { platform: string; url: string }[]
    location: { latitude: number; longitude: number; description: string }
  }> = {},
) {
  const { tagIds, socials, location, ...fields } = overrides

  // `webId`/`listingId`/`userId` are passed as scalars, which puts Prisma into
  // its "unchecked" input mode — that has no nested write for `location`, so
  // the row has to exist first.
  const locationId = location
    ? (await prisma.listingLocation.create({ data: location })).id
    : undefined

  return prisma.listingEdit.create({
    data: {
      webId,
      listingId,
      userId,
      title: `Proposed title ${uniq()}`,
      ...fields,
      ...(tagIds?.length
        ? { tags: { connect: tagIds.map((id) => ({ id })) } }
        : {}),
      ...(socials?.length ? { socials: { create: socials } } : {}),
      locationId,
    },
    include: { tags: true, socials: true },
  })
}
