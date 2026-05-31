import type { NextRequest } from 'next/server'
import prisma from '@prisma-rw'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const rawEmail = (body as { email?: unknown })?.email

  if (typeof rawEmail !== 'string') {
    return Response.json({ error: 'Email is required' }, { status: 400 })
  }

  const email = rawEmail.trim().toLowerCase()

  if (!EMAIL_REGEX.test(email)) {
    return Response.json({ error: 'A valid email is required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  return Response.json({ exists: !!user })
}
