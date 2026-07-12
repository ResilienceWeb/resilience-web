import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { getSessionSafe } from '@auth'

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> },
) {
  const params = await props.params
  const session = await getSessionSafe(request.headers)

  if (session?.user.role !== 'admin') {
    return new Response('Unauthorized', {
      status: 403,
    })
  }

  try {
    await prisma.web.update({
      where: {
        slug: params.slug,
      },
      data: {
        published: true,
      },
    })
    // Only set publishedAt on first publish, so re-publishing doesn't reset it
    await prisma.web.updateMany({
      where: {
        slug: params.slug,
        publishedAt: null,
      },
      data: {
        publishedAt: new Date(),
      },
    })
    revalidatePath('/')
    revalidatePath(`/${params.slug}`)

    return new Response('Web published', {
      status: 200,
    })
  } catch (e) {
    console.error(`[RW] Unable to publish web - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to publish web - ${e}`, {
      status: 500,
    })
  }
}
