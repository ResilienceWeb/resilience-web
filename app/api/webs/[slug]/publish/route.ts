import { auth } from '@auth'
import prisma from '@prisma-rw'

export async function POST(_request, { params }) {
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

    return new Response('Web published', {
      status: 200,
    })
  } catch (e) {
    console.error(`[RW] Unable to publish web - ${e}`)
    return new Response(`Unable to publish web - ${e}`, {
      status: 500,
    })
  }
}
