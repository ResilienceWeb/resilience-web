import { WebRole } from '@prisma-client'
import { describe, expect, it } from 'vitest'
import prisma from '@prisma-rw'
import {
  createListing,
  createUser,
  createUserWithWebAccess,
  createWeb,
} from '../../../../test/factories/index.ts'
import { params, request } from '../../../../test/http.ts'
import { signInAs } from '../../../../test/session.ts'
import { GET, PATCH, PUT } from '../[slug]/route.ts'

const webForm = (fields: Record<string, string> = {}) => {
  const form = new FormData()
  form.set('title', 'Bristol')
  form.set('published', 'true')
  form.set('contactEmail', 'hello@example.com')
  form.set('description', 'A web')
  form.set('relatedWebIds', '')
  Object.entries(fields).forEach(([key, value]) => form.set(key, value))
  return form
}

describe('GET /api/webs/[slug]', () => {
  it('404s for an unknown web', async () => {
    const response = await GET(
      request('/api/webs/nope'),
      params({ slug: 'nope' }),
    )

    expect(response.status).toBe(404)
  })

  it('404s for a soft-deleted web', async () => {
    await createWeb({ slug: 'bristol', deletedAt: new Date() })

    const response = await GET(
      request('/api/webs/bristol'),
      params({ slug: 'bristol' }),
    )

    expect(response.status).toBe(404)
  })

  it('flattens placements into listing-shaped objects when asked', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await createListing(web.id, { title: 'Food Hub', slug: 'food-hub' })

    const response = await GET(
      request('/api/webs/bristol?withListings=true'),
      params({ slug: 'bristol' }),
    )
    const { web: payload } = await response.json()

    expect(payload.listings).toHaveLength(1)
    expect(payload.listings[0]).toMatchObject({
      title: 'Food Hub',
      slug: 'food-hub',
    })
  })

  it('returns bare placements, not listing data, unless withListings is set', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await createListing(web.id, { title: 'Food Hub', slug: 'food-hub' })

    const response = await GET(
      request('/api/webs/bristol'),
      params({ slug: 'bristol' }),
    )
    const { web: payload } = await response.json()

    expect(payload.listings).toHaveLength(1)
    expect(payload.listings[0]).toMatchObject({
      slug: 'food-hub',
      webId: web.id,
    })
    expect(payload.listings[0].title).toBeUndefined()
  })
})

describe('PUT /api/webs/[slug]', () => {
  it('rejects an anonymous caller', async () => {
    await createWeb({ slug: 'bristol' })

    const response = await PUT(
      request('/api/webs/bristol', { method: 'PUT', body: webForm() }),
      params({ slug: 'bristol' }),
    )

    expect(response.status).toBe(403)
  })

  it('rejects an editor', async () => {
    const web = await createWeb({ slug: 'bristol', title: 'Original' })
    const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
    signInAs({ id: user.id, email: user.email })

    const response = await PUT(
      request('/api/webs/bristol', { method: 'PUT', body: webForm() }),
      params({ slug: 'bristol' }),
    )

    expect(response.status).toBe(403)
    expect(
      (await prisma.web.findUnique({ where: { slug: 'bristol' } }))?.title,
    ).toBe('Original')
  })

  it('rejects an owner of a different web', async () => {
    await createWeb({ slug: 'bristol' })
    const otherWeb = await createWeb({ slug: 'cambridge' })
    const { user } = await createUserWithWebAccess(otherWeb.id, WebRole.OWNER)
    signInAs({ id: user.id, email: user.email })

    const response = await PUT(
      request('/api/webs/bristol', { method: 'PUT', body: webForm() }),
      params({ slug: 'bristol' }),
    )

    expect(response.status).toBe(403)
  })

  it('allows an owner to update the web', async () => {
    const web = await createWeb({ slug: 'bristol', title: 'Original' })
    const { user } = await createUserWithWebAccess(web.id, WebRole.OWNER)
    signInAs({ id: user.id, email: user.email })

    const response = await PUT(
      request('/api/webs/bristol', {
        method: 'PUT',
        body: webForm({ title: 'Bristol Resilience Web' }),
      }),
      params({ slug: 'bristol' }),
    )

    expect(response.status).toBe(200)
    expect(
      (await prisma.web.findUnique({ where: { slug: 'bristol' } }))?.title,
    ).toBe('Bristol Resilience Web')
  })

  it('allows a global admin without web access', async () => {
    await createWeb({ slug: 'bristol', title: 'Original' })
    const admin = await createUser({ role: 'admin' })
    signInAs({ id: admin.id, email: admin.email, role: 'admin' })

    const response = await PUT(
      request('/api/webs/bristol', {
        method: 'PUT',
        body: webForm({ title: 'Renamed' }),
      }),
      params({ slug: 'bristol' }),
    )

    expect(response.status).toBe(200)
  })

  it('stamps publishedAt on first publish only', async () => {
    const web = await createWeb({ slug: 'bristol', published: false })
    const { user } = await createUserWithWebAccess(web.id, WebRole.OWNER)
    signInAs({ id: user.id, email: user.email })

    const put = () =>
      PUT(
        request('/api/webs/bristol', { method: 'PUT', body: webForm() }),
        params({ slug: 'bristol' }),
      )

    await put()
    const first = await prisma.web.findUnique({ where: { slug: 'bristol' } })
    expect(first?.publishedAt).toBeInstanceOf(Date)

    await put()
    const second = await prisma.web.findUnique({ where: { slug: 'bristol' } })
    expect(second?.publishedAt?.getTime()).toBe(first?.publishedAt?.getTime())
  })
})

describe('PATCH /api/webs/[slug]', () => {
  it('rejects a web owner who is not a global admin', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const { user } = await createUserWithWebAccess(web.id, WebRole.OWNER)
    signInAs({ id: user.id, email: user.email })

    const response = await PATCH(
      request('/api/webs/bristol', {
        method: 'PATCH',
        body: { feature: 'show-map', enabled: true, webId: web.id },
      }),
      params({ slug: 'bristol' }),
    )

    expect(response.status).toBe(403)
    expect(await prisma.webFeature.count()).toBe(0)
  })

  it('lets an admin toggle a feature on and back off', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const admin = await createUser({ role: 'admin' })
    signInAs({ id: admin.id, email: admin.email, role: 'admin' })

    const patch = (enabled: boolean) =>
      PATCH(
        request('/api/webs/bristol', {
          method: 'PATCH',
          body: { feature: 'show-map', enabled, webId: web.id },
        }),
        params({ slug: 'bristol' }),
      )

    expect((await patch(true)).status).toBe(200)
    expect(
      (await prisma.webFeature.findFirst({ where: { webId: web.id } }))
        ?.enabled,
    ).toBe(true)

    expect((await patch(false)).status).toBe(200)
    expect(await prisma.webFeature.count()).toBe(1)
    expect(
      (await prisma.webFeature.findFirst({ where: { webId: web.id } }))
        ?.enabled,
    ).toBe(false)
  })
})
