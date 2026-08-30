import type { NextRequest } from 'next/server'
import { callerIp, rateLimit, tooManyRequests } from '@/lib/rate-limit'
import prisma from '@prisma-rw'

export async function POST(request: NextRequest) {
  // Answering "does this address have an account" is an enumeration oracle.
  // The signup form asks once per attempt, so a human never approaches this.
  const limit = await rateLimit('check-email', callerIp(request), 10, 10 * 60)
  if (!limit.ok) {
    return tooManyRequests(limit, 'Too many attempts. Please try again later.')
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const rawEmail = (body as { email?: unknown })?.email

  if (typeof rawEmail !== 'string' || rawEmail.trim() === '') {
    return Response.json({ error: 'Email is required' }, { status: 400 })
  }

  const email = rawEmail.trim().toLowerCase()

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  return Response.json({ exists: !!user })
}
