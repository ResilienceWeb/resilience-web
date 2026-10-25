import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import { requireWebEditor } from '@/lib/api-authorization'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { isSelectableIcon } from '@helpers/icons'
import { findSharedTagWithLabel } from '@db/tagRepository'
import { findTag, sharedTagRefusal } from '../authorization.ts'

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const tagId = Number(params.id)
  const body = await request.json()

  const existing = await findTag(tagId)
  if (!existing) {
    return Response.json({ error: 'Tag not found' }, { status: 404 })
  }
  if (existing.webId === null) {
    return sharedTagRefusal()
  }

  const denied = await requireWebEditor(request, existing.webId)
  if (denied) return denied

  if (body.icon != null && !isSelectableIcon(body.icon)) {
    return Response.json({ error: 'Unknown icon' }, { status: 400 })
  }

  const sharedTag =
    body.label !== undefined ? await findSharedTagWithLabel(body.label) : null
  if (sharedTag) {
    return Response.json(
      { error: `"${sharedTag.label}" is already a shared tag`, sharedTag },
      { status: 409 },
    )
  }

  try {
    const tag = await prisma.tag.update({
      where: {
        id: tagId,
      },
      data: {
        ...(body.label !== undefined ? { label: body.label } : {}),
        ...(body.icon !== undefined ? { icon: body.icon } : {}),
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

  const existing = await findTag(tagId)
  if (!existing) {
    return Response.json({ error: 'Tag not found' }, { status: 404 })
  }
  if (existing.webId === null) {
    return sharedTagRefusal()
  }

  const denied = await requireWebEditor(request, existing.webId)
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
