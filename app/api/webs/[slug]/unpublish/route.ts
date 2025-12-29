import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { auth } from '@auth'

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> },
) {
  const params = await props.params
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (session?.user.role !== 'admin') {
    return new Response('Unauthorized', {
      status: 403,
    })
  }

  try {
    const slug = params.slug

    // Get the web to unpublish
    const web = await prisma.web.findUnique({
      where: {
        slug,
      },
    })

    if (!web) {
      return Response.json({ message: 'Web not found' }, { status: 404 })
    }

    // Only perform the unpublish if the web is currently published
    if (!web.published) {
      return Response.json(
        {
          web,
          message: 'Web is already unpublished',
        },
        { status: 200 },
      )
    }

    await prisma.web.update({
      where: {
        slug,
      },
      data: {
        published: false,
      },
    })
    revalidatePath('/')

    return Response.json({
      status: 200,
    })
  } catch (e) {
    console.error(`[RW] Unable to unpublish web - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      { message: `Unable to unpublish web - ${e.message}` },
      { status: 500 },
    )
  }
}
