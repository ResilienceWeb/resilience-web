import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const categoryId = params.id
  const body = await request.json()

  try {
    const category = await prisma.category.update({
      where: {
        id: Number(categoryId),
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

    revalidatePath(`/${category.web.slug}`)

    return Response.json({ data: category })
  } catch (e) {
    console.error(`[RW] Unable to update category - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to update category - ${e}`, {
      status: 500,
    })
  }
}

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const categoryId = params.id

  try {
    const category = await prisma.category.delete({
      where: {
        id: Number(categoryId),
      },
    })

    return Response.json({ data: category })
  } catch (e) {
    console.error(`[RW] Unable to delete category - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to delete category - ${e}`, {
      status: 500,
    })
  }
}
