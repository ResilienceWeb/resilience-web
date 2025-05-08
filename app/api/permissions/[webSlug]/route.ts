import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { auth } from '@auth'

export async function GET(_request, props) {
  const params = await props.params
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        {
          error: `You don't have enough permissions to access this data.`,
        },
        {
          status: 403,
        },
      )
    }

    const webSlug = params.webSlug
    const permissions = await prisma.permission.findMany({
      where: {
        webs: {
          some: {
            slug: {
              equals: webSlug,
            },
          },
        },
      },
      include: {
        webs: true,
        user: true,
      },
    })

    return Response.json({
      permissions,
    })
  } catch (e) {
    console.error(`[RW] Unable to fetch permissions - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to fetch permissions - ${e}`, {
      status: 500,
    })
  }
}
