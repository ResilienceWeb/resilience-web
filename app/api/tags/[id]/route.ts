import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import { requireWebEditor } from '@/lib/api-authorization'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { findTagWebId } from '../authorization.ts'

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const tagId = Number(params.id)
  const body = await request.json()

  const webId = await findTagWebId(tagId)
  if (webId === null) {
    return Response.json({ error: 'Tag not found' }, { status: 404 })
  }

  const denied = await requireWebEditor(request, webId)
  if (denied) return denied

  try {
    // Enumerated, not spread: `data: body` would let the caller move the tag
    // to a web they have no rights over.
    const tag = await prisma.tag.update({
      where: {
        id: tagId,
      },
      data: {
        ...(body.label !== undefined ? { label: body.label } : {}),
      },
      include: {
        web: {
          select: {
            slug: true,
          },
        },
      },
    })

    revalidatePath(`/${tag.web.slug}`)

    return Response.json({ data: tag })
  } catch (e) {
    console.error(`[RW] Unable to update tag - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to update tag - ${e}`, {
      status: 500,
    })
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const tagId = Number(params.id)

  const webId = await findTagWebId(tagId)
  if (webId === null) {
    return Response.json({ error: 'Tag not found' }, { status: 404 })
  }

  const denied = await requireWebEditor(request, webId)
  if (denied) return denied

  try {
    const tag = await prisma.tag.delete({
      where: {
        id: tagId,
      },
      include: {
        web: {
          select: {
            slug: true,
          },
        },
      },
    })

    // The web page's tag filter is built server-side, so a deleted tag has to
    // be rebuilt out of it.
    revalidatePath(`/${tag.web.slug}`)

    return Response.json({ data: tag })
  } catch (e) {
    console.error(`[RW] Unable to delete tag - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to delete tag - ${e}`, {
      status: 500,
    })
  }
}
