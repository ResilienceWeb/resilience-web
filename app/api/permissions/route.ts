import { removeUserPermission } from '@db/permissionRepository'
import { isOwnerOfWeb } from '@db/webRepository'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { auth } from '@auth'

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
    Sentry.captureException(e)
    return new Response(`Unable to fetch permissions - ${e}`, {
      status: 500,
    })
  }
}

export async function PUT(request: Request) {
  const session = await auth()
  const body = await request.json()
  const { webId, userEmail } = body
  console.log('session', session)
  const isOwner = await isOwnerOfWeb(session.user.id, webId)

  if (!session?.user || !isOwner) {
    return Response.json(
      {
        error: `You don't have enough permissions to perform this action.`,
      },
      {
        status: 403,
      },
    )
  }

  try {
    console.log('PUT', userEmail, webId)
    await removeUserPermission(userEmail, Number(webId))

    return Response.json({
      success: true,
    })
  } catch (e) {
    console.error(`[RW] Unable to update permission - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to update permission - ${e}`, {
      status: 500,
    })
  }
}
