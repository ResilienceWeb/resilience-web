import prisma from '@prisma-rw'

/** The web a tag belongs to is what the caller needs rights over. */
export async function findTagWebId(tagId: number) {
  if (!Number.isInteger(tagId)) {
    return null
  }
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
    select: { webId: true },
  })
  return tag?.webId ?? null
}
