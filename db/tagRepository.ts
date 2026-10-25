import type { Prisma } from '@prisma-client'
import prisma from '@prisma-rw'
import { sameTagLabel } from '@helpers/tags'

/** Tags a listing in this web may be given: its own, and the shared ones still in use. */
export const usableInWeb = (webId: number): Prisma.TagWhereInput => ({
  OR: [{ webId }, { webId: null, retiredAt: null }],
})

/**
 * Narrows requested tag ids to the ones a listing in this web may be given,
 * so a form can't attach another web's tag or a retired shared tag.
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

/** The shared tag a web tag's label would duplicate, if any, retired or not. */
export async function findSharedTagWithLabel(label: unknown) {
  if (typeof label !== 'string') {
    return null
  }
  const sharedTags = await prisma.tag.findMany({
    where: { webId: null },
    select: { id: true, label: true },
  })
  return sharedTags.find((tag) => sameTagLabel(tag.label, label)) ?? null
}
