import type { NextRequest } from 'next/server'
import prisma from '@prisma-rw'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email) {
    return Response.json({ error: 'Email is required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  return Response.json({ exists: !!user })
}
