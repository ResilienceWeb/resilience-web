import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import { requireWebEditor } from '@/lib/api-authorization'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

async function findCategoryWebId(categoryId: number) {
  if (!Number.isInteger(categoryId)) {
    return null
  }
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { webId: true },
  })
  return category?.webId ?? null
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const categoryId = Number(params.id)
  const body = await request.json()

  const webId = await findCategoryWebId(categoryId)
  if (webId === null) {
    return Response.json({ error: 'Category not found' }, { status: 404 })
  }

  const denied = await requireWebEditor(request, webId)
  if (denied) return denied

  try {
    const category = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        ...(body.label !== undefined ? { label: body.label } : {}),
        ...(body.color !== undefined ? { color: body.color } : {}),
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
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const categoryId = Number(params.id)

  const webId = await findCategoryWebId(categoryId)
  if (webId === null) {
    return Response.json({ error: 'Category not found' }, { status: 404 })
  }

  const denied = await requireWebEditor(request, webId)
  if (denied) return denied

  try {
    const category = await prisma.category.delete({
      where: {
        id: categoryId,
      },
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
    console.error(`[RW] Unable to delete category - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to delete category - ${e}`, {
      status: 500,
    })
  }
}
