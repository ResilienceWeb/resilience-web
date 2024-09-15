import { auth } from '@auth'
import prisma from '../../../../prisma/client'

export async function GET(_request, { params }) {
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
    return new Response(`Unable to fetch permissions - ${e}`, {
      status: 500,
    })
  }
}
