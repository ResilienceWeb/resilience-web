import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { resolveTagWeb } from '../../authorization.ts'

/**
 * Which shared tags a web uses. Adding one puts it in the web's pickers;
 * removing it also takes it off the web's listings. Web tags belong to their
 * web already, so neither applies to them.
 */
async function resolveSharedTagWeb(request: NextRequest, tagId: number) {
  const body = await request.json().catch(() => ({}))

  const resolved = await resolveTagWeb(request, tagId, body)
  if (resolved.error) return resolved

  if (resolved.tag.webId !== null) {
    return {
      error: Response.json(
        { error: 'Only shared tags are added to or removed from a web' },
        { status: 400 },
      ),
    }
  }

  return resolved
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const tagId = Number((await props.params).id)
  const { tag, webId, error } = await resolveSharedTagWeb(request, tagId)
  if (error) return error

  if (tag.retiredAt) {
    return Response.json(
      { error: 'A retired shared tag cannot be added to a web' },
      { status: 409 },
    )
  }

  try {
    const added = await prisma.webSharedTag.upsert({
      where: { webId_tagId: { webId, tagId } },
      create: { webId, tagId },
      update: {},
    })

    return Response.json({ data: added })
  } catch (e) {
    console.error(`[RW] Unable to add shared tag to web - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to add shared tag to web - ${e}`, {
      status: 500,
    })
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const tagId = Number((await props.params).id)
  const { webId, error } = await resolveSharedTagWeb(request, tagId)
  if (error) return error

  try {
    const placements = await prisma.listingPlacement.findMany({
      where: { webId, tags: { some: { id: tagId } } },
      select: { id: true },
    })

    await prisma.$transaction([
      prisma.tag.update({
        where: { id: tagId },
        data: { listings: { disconnect: placements } },
      }),
      prisma.webSharedTag.deleteMany({ where: { webId, tagId } }),
    ])

    return Response.json({ data: { removedFromListings: placements.length } })
  } catch (e) {
    console.error(`[RW] Unable to remove shared tag from web - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to remove shared tag from web - ${e}`, {
      status: 500,
    })
  }
}
