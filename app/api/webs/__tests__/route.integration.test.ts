import { createUserWithWebAccess, createWeb } from '@/test/factories'
import { request } from '@/test/http'
import { signInAs } from '@/test/session'
import { WebRole } from '@prisma-client'
import checkWebInactiveTask from '@trigger/check-web-inactive'
import { describe, expect, it, vi } from 'vitest'
import prisma from '@prisma-rw'
import { POST } from '../route.ts'

vi.mock('@trigger/check-web-inactive', () => ({
  default: { trigger: vi.fn().mockResolvedValue({ id: 'run_1' }) },
}))

const createRequest = (body: Record<string, unknown>) =>
  request('/api/webs', { method: 'POST', body })

const newWeb = {
  title: 'Middlesbrough',
  slug: 'middlesbrough',
  description: '<p>A web</p>',
  contactEmail: 'hello@example.com',
  location: {
    latitude: 54.57,
    longitude: -1.23,
    description: 'Middlesbrough',
  },
}

describe('POST /api/webs', () => {
  it('403s when signed out', async () => {
    const response = await POST(createRequest(newWeb))

    expect(response.status).toBe(403)
  })

  it('lets someone who already owns a web create another', async () => {
    const existing = await createWeb({ slug: 'bristol' })
    const { user } = await createUserWithWebAccess(existing.id, WebRole.OWNER)
    signInAs({ id: user.id, email: user.email })

    const response = await POST(createRequest(newWeb))

    expect(response.status).toBe(200)
    const owned = await prisma.webAccess.findMany({
      where: { email: user.email, role: WebRole.OWNER },
    })
    expect(owned).toHaveLength(2)
  })

  it('still succeeds when the inactive-web job cannot be scheduled', async () => {
    vi.mocked(checkWebInactiveTask.trigger).mockRejectedValueOnce(
      new Error('Trigger.dev v3 is no longer supported'),
    )
    const { user } = await createUserWithWebAccess(
      (await createWeb({ slug: 'bristol' })).id,
      WebRole.OWNER,
    )
    signInAs({ id: user.id, email: user.email })

    const response = await POST(createRequest(newWeb))

    expect(response.status).toBe(200)
    expect(
      await prisma.web.findUnique({ where: { slug: 'middlesbrough' } }),
    ).not.toBeNull()
  })

  it('409s when the link is taken', async () => {
    await createWeb({ slug: 'middlesbrough' })
    const { user } = await createUserWithWebAccess(
      (await createWeb({ slug: 'bristol' })).id,
      WebRole.OWNER,
    )
    signInAs({ id: user.id, email: user.email })

    const response = await POST(createRequest(newWeb))

    expect(response.status).toBe(409)
  })
})
