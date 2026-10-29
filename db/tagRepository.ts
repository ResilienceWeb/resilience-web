import type { Prisma } from '@prisma-client'
import prisma from '@prisma-rw'
import { sameTagLabel } from '@helpers/tags'

/**
 * Tags a listing in this web may be given: its own, and the shared ones it has
 * added that are still in use.
 */
export const usableInWeb = (webId: number): Prisma.TagWhereInput => ({
  OR: [
    { webId },
    { webId: null, retiredAt: null, addedToWebs: { some: { webId } } },
  ],
})

/**
 * Narrows requested tag ids to the ones a listing in this web may be given,
 * so a form can't attach another web's tag, or a shared tag the web hasn't
 * added or that has been retired.
 */
export async function findTagsUsableInWeb(ids: unknown[], webId: number) {
  const numeric = ids.map(Number).filter(Number.isInteger)
  if (numeric.length === 0) {
    return []
  }
  return prisma.tag.findMany({
    where: { id: { in: numeric }, ...usableInWeb(webId) },
    select: { id: true },
  })
}

export async function findTagUsableInWeb(tagId: number, webId: number) {
  return prisma.tag.findFirst({
    where: { id: tagId, ...usableInWeb(webId) },
    select: { id: true },
  })
}

/** The shared tag a web tag's label would duplicate, if any, retired or not. */
export async function findSharedTagWithLabel(label: unknown) {
  if (typeof label !== 'string') {
    return null
  }
  const sharedTags = await prisma.tag.findMany({
    where: { webId: null },
    select: { id: true, label: true, retiredAt: true },
  })
  return sharedTags.find((tag) => sameTagLabel(tag.label, label)) ?? null
}

/** The refusal for a web tag that would take a shared tag's name. */
export function sharedTagConflict(sharedTag: {
  label: string
  retiredAt: Date | null
}) {
  const error = sharedTag.retiredAt
    ? `"${sharedTag.label}" is a retired shared tag, so it can't be used as a tag name`
    : `"${sharedTag.label}" is already a shared tag. Add it to this web from the Tags page instead.`
  return Response.json({ error, sharedTag }, { status: 409 })
}
