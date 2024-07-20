import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

import { authOptions } from '../../auth'
import { Prisma } from '@prisma/client'
import prisma from '../../../prisma/client'

export async function GET(request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(
      `You don't have enough permissions to perform this action.`,
      {
        status: 403,
      },
    )
  }

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
}
