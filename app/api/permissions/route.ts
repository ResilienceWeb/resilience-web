import { getServerSession } from 'next-auth'

import { authOptions } from '../../auth'
import { Prisma } from '@prisma/client'
import prisma from '../../../prisma/client'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new Response(
        `You don't have enough permissions to perform this action.`,
        {
          status: 403,
        },
      )
    }

    // TODO: below doesn't work, needs updating
    const { email: targetEmail, listings, webs } = request?.body ?? {}

    const email = targetEmail ?? session?.user.email
    const permission = await prisma.permission.findUnique({
      include: {
        listings: true,
        webs: true,
      },
      where: { email },
    })

    return Response.json({ permission })
  } catch (e) {
    console.error(`[RW] Unable to fetch permissions - ${e}`)
    return new Response(`Unable to fetch permissions - ${e}`, {
      status: 500,
    })
  }
}
