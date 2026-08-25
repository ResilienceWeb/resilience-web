import {
  createUser,
  createUserWithWebAccess,
  createWeb,
} from '@/test/factories'
import { request } from '@/test/http'
import { signInAs } from '@/test/session'
import { WebRole } from '@prisma-client'
import { describe, expect, it } from 'vitest'
import prisma from '@prisma-rw'
import { POST } from '../invite/route.ts'

const invite = (webId: number, email: string, asOwner = false) =>
  POST(
    request('/api/users/invite', {
      method: 'POST',
      body: { email, web: webId, asOwner },
    }),
  )

describe('POST /api/users/invite', () => {
  it('rejects an anonymous caller and grants nothing', async () => {
    const web = await createWeb({ slug: 'bristol' })

    const response = await invite(web.id, 'intruder@example.com')

    expect(response.status).toBe(403)
    expect(await prisma.webAccess.count()).toBe(0)
  })

  it('does not let a signed-in stranger make themselves an owner', async () => {
    // The invite form is owner-only in the admin UI, so this was reachable
    // only by posting directly - and it granted OWNER on any web.
    const web = await createWeb({ slug: 'bristol' })
    const stranger = await createUser()
    signInAs({ id: stranger.id, email: stranger.email })

    const response = await invite(web.id, stranger.email, true)

    expect(response.status).toBe(403)
    expect(await prisma.webAccess.count()).toBe(0)
  })

  it('does not let an editor of the web invite anyone', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await invite(web.id, 'new@example.com')

    expect(response.status).toBe(403)
    expect(await prisma.webAccess.count()).toBe(1)
  })

  it('does not let an owner of a different web invite', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const { user } = await createUserWithWebAccess(otherWeb.id, WebRole.OWNER)
    signInAs({ id: user.id, email: user.email })

    const response = await invite(web.id, 'new@example.com')

    expect(response.status).toBe(403)
    expect(await prisma.webAccess.count({ where: { webId: web.id } })).toBe(0)
  })

  it('lets an owner of the web invite an editor', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const { user } = await createUserWithWebAccess(web.id, WebRole.OWNER)
    signInAs({ id: user.id, email: user.email })

    const response = await invite(web.id, 'new@example.com')

    expect(response.status).toBe(200)
    expect(
      await prisma.webAccess.findUnique({
        where: { user_web_access: { email: 'new@example.com', webId: web.id } },
      }),
    ).toMatchObject({ role: WebRole.EDITOR })
  })

  it('lets a global admin invite an owner to any web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const admin = await createUser({ role: 'admin' })
    signInAs({ id: admin.id, email: admin.email, role: 'admin' })

    const response = await invite(web.id, 'new@example.com', true)

    expect(response.status).toBe(200)
    expect(
      await prisma.webAccess.findUnique({
        where: { user_web_access: { email: 'new@example.com', webId: web.id } },
      }),
    ).toMatchObject({ role: WebRole.OWNER })
  })

  it('404s for a soft-deleted web', async () => {
    const web = await createWeb({ slug: 'bristol', deletedAt: new Date() })
    const admin = await createUser({ role: 'admin' })
    signInAs({ id: admin.id, email: admin.email, role: 'admin' })

    const response = await invite(web.id, 'new@example.com')

    expect(response.status).toBe(404)
    expect(await prisma.webAccess.count()).toBe(0)
  })
})
