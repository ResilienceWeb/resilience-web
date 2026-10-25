import prisma from '@prisma-rw'

/**
 * The tag a route acts on. Its web is what the caller needs rights over; a
 * shared tag has none, so no web's editors may change it.
 */
export async function findTag(tagId: number) {
  if (!Number.isInteger(tagId)) {
    return null
  }
  return prisma.tag.findUnique({
    where: { id: tagId },
    select: { webId: true, retiredAt: true },
  })
}

export const sharedTagRefusal = () =>
  Response.json(
    { error: 'Shared tags are the same in every web and cannot be changed' },
    { status: 403 },
  )
