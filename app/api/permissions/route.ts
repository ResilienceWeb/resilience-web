import { auth } from '@auth'
import prisma from '../../../prisma/client'

export async function GET(request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return new Response(
        `You don't have enough permissions to perform this action.`,
        {
          status: 403,
        },
      )
    }

    const searchParams = request.nextUrl.searchParams
    const targetEmail = searchParams.get('email')

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
