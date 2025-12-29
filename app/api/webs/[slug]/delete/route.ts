import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { auth } from '@auth'
import { deleteWebBySlug, getWebBySlug } from '@db/webRepository'

export async function DELETE(
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

    const web = await getWebBySlug(slug)

    if (!web) {
      return Response.json({ message: 'Web not found' }, { status: 404 })
    }

    await deleteWebBySlug(slug)

    revalidatePath('/')
    revalidatePath(`/${slug}`)

    return Response.json({
      message: 'Web deleted successfully',
      status: 200,
    })
  } catch (e) {
    console.error(`[RW] Unable to delete web - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      { message: `Unable to delete web - ${e.message}` },
      { status: 500 },
    )
  }
}
