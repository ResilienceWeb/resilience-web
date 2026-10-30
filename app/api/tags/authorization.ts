import type { NextRequest } from 'next/server'
import { requireWebEditor } from '@/lib/api-authorization'
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
    select: { webId: true, label: true, retiredAt: true },
  })
}

export const sharedTagRefusal = () =>
  Response.json(
    { error: 'Shared tags are the same in every web and cannot be changed' },
    { status: 403 },
  )

/**
 * A web tag only ever reaches its own web. A shared tag reaches every web, so
 * the caller names the one they edit, and only its placements are touched.
 */
export async function resolveTagWeb(
  request: NextRequest,
  tagId: number,
  body: { webId?: unknown } | null,
) {
  const tag = await findTag(tagId)
  if (!tag) {
    return {
      error: Response.json({ error: 'Tag not found' }, { status: 404 }),
    }
  }

  const webId = tag.webId ?? Number(body?.webId)
  if (!Number.isInteger(webId)) {
    return {
      error: Response.json(
        { error: 'webId is required for a shared tag' },
        { status: 400 },
      ),
    }
  }

  const denied = await requireWebEditor(request, webId)
  if (denied) return { error: denied }

  return { tag, webId }
}
