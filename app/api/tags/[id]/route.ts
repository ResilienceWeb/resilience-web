import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const tagId = params.id
  const body = await request.json()

  try {
    const tag = await prisma.tag.update({
      where: {
        id: Number(tagId),
      },
      data: body,
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
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const id = params.id

  try {
    const tag = await prisma.tag.delete({
      where: {
        id: Number(id),
      },
    })

    return Response.json({ data: tag })
  } catch (e) {
    console.error(`[RW] Unable to delete tag - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to delete tag - ${e}`, {
      status: 500,
    })
  }
}
