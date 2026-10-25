// Relative imports, and the client passed in, so that plain `node` can run this
// from scripts/merge-web-tags-into-shared-tags.ts.
import { sameTagLabel } from '../helpers/tags.ts'
import type { PrismaClient } from '../prisma/generated/client.ts'

export type DuplicateWebTag = {
  webSlug: string
  webTag: { id: number; label: string }
  sharedTag: { id: number; label: string; key: string | null }
  placementIds: number[]
  listingEditIds: number[]
}

/**
 * Web tags whose label matches a shared tag's, ignoring case and surrounding
 * space but nothing else: "Repair Cafe" is not "Repair Café".
 */
export async function findWebTagsDuplicatingSharedTags(
  prisma: PrismaClient,
): Promise<DuplicateWebTag[]> {
  const sharedTags = await prisma.tag.findMany({
    where: { webId: null },
    select: { id: true, label: true, key: true },
  })
  const webTags = await prisma.tag.findMany({
    where: { webId: { not: null } },
    select: {
      id: true,
      label: true,
      web: { select: { slug: true } },
      listings: { select: { id: true } },
      listingEdits: { select: { id: true } },
    },
    orderBy: { id: 'asc' },
  })

  return webTags.flatMap((webTag) => {
    const sharedTag = sharedTags.find((s) =>
      sameTagLabel(s.label, webTag.label),
    )
    if (!sharedTag) {
      return []
    }
    return [
      {
        webSlug: webTag.web.slug,
        webTag: { id: webTag.id, label: webTag.label },
        sharedTag: {
          id: sharedTag.id,
          label: sharedTag.label,
          key: sharedTag.key,
        },
        placementIds: webTag.listings.map((p) => p.id),
        listingEditIds: webTag.listingEdits.map((e) => e.id),
      },
    ]
  })
}

/**
 * Moves each duplicate's listings, and the pending edits that picked it, onto
 * the shared tag, then deletes the web tag.
 */
export async function mergeWebTagsIntoSharedTags(
  prisma: PrismaClient,
  duplicates: DuplicateWebTag[],
) {
  for (const duplicate of duplicates) {
    await prisma.$transaction([
      prisma.tag.update({
        where: { id: duplicate.sharedTag.id },
        data: {
          listings: {
            connect: duplicate.placementIds.map((id) => ({ id })),
          },
          listingEdits: {
            connect: duplicate.listingEditIds.map((id) => ({ id })),
          },
        },
      }),
      prisma.tag.delete({ where: { id: duplicate.webTag.id } }),
    ])
  }
}
