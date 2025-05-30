import { revalidatePath } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { auth } from '@auth'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'

export async function POST(_request, props) {
  const params = await props.params
  const session = await auth()

  if (!session?.user.admin) {
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
