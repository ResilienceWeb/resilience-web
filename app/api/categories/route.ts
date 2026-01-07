import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import type { Category } from '@prisma-client'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const web = searchParams.get('web')

    const categories: Category[] = await prisma.category.findMany({
      where: {
        web: {
          slug: {
            equals: web,
          },
          deletedAt: null,
        },
      },
      include: {
        listings: true,
      },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    })

    return Response.json({ data: categories })
  } catch (e) {
    console.error(`[RW] Unable to fetch categories - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to fetch categories - ${e}`, {
      status: 500,
    })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  try {
    const category = await prisma.category.create({
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
    console.error(`[RW] Unable to create category - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to create category - ${e}`, {
      status: 500,
    })
  }
}
