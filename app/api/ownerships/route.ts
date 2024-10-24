import { auth } from '@auth'
import prisma from '@prisma-rw'

export async function GET(request) {
  try {
    const session = await auth()

    if (!session || !session?.user) {
      return new Response(`You don't have permission to perform this action.`, {
        status: 403,
      })
    }

    const searchParams = request.nextUrl.searchParams
    const web = searchParams.get('web')

    let ownerships
    if (web) {
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
