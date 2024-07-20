import { getServerSession } from 'next-auth'

import { authOptions } from '../../auth'
import prisma from '../../../prisma/client'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session?.user) {
      return new Response(`You don't have permission to perform this action.`, {
        status: 403,
      })
    }

    const { web } = request.query ?? {}

    let ownerships
    if (web !== undefined) {
      ownerships = await prisma.ownership.findMany({
        where: {
          webs: {
            some: {
              slug: {
                equals: web,
              },
            },
          },
        },
        include: {
          user: true,
        },
      })
    } else {
      const ownership = await prisma.ownership.findUnique({
        where: {
          email: session.user.email,
        },
        include: {
          user: true,
          webs: true,
        },
      })

      ownerships = ownership?.webs ?? []
    }

    return Response.json({ ownerships })
  } catch (e) {
    console.error(`[RW] Unable to fetch ownerships - ${e}`)
    return new Response(`Unable to fetch ownerships - ${e}`, {
      status: 500,
    })
  }
}
