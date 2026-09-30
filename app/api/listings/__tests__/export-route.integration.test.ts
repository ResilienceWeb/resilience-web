import {
  createCategory,
  createListing,
  createUser,
  createUserWithWebAccess,
  createWeb,
} from '@/test/factories'
import { request } from '@/test/http'
import { signInAs } from '@/test/session'
import { WebRole } from '@prisma-client'
import Papa from 'papaparse'
import { describe, expect, it } from 'vitest'
import prisma from '@prisma-rw'
import { GET } from '../export/route.ts'

const exportWeb = (slug: string) =>
  GET(request(`/api/listings/export?web=${slug}`))

const rowsOf = async (response: Response) =>
  Papa.parse<Record<string, string>>(await response.text(), { header: true })
    .data

async function signInAsEditorOf(webId: number) {
  const { user } = await createUserWithWebAccess(webId, WebRole.EDITOR)
  signInAs({ id: user.id, email: user.email })
}

describe('GET /api/listings/export', () => {
  it('asks a visitor to sign in', async () => {
    await createWeb({ slug: 'bristol' })

    const response = await exportWeb('bristol')

    expect(response.status).toBe(401)
  })

  it("won't hand one web's listings to an editor of another", async () => {
    const bristol = await createWeb({ slug: 'bristol' })
    const cambridge = await createWeb({ slug: 'cambridge' })
    await createListing(bristol.id, { title: 'Food Hub' })
    await signInAsEditorOf(cambridge.id)

    const response = await exportWeb('bristol')

    expect(response.status).toBe(403)
  })

  it('lets a site admin export any web', async () => {
    const web = await createWeb({ slug: 'bristol' })
    await createListing(web.id, { title: 'Food Hub' })
    const admin = await createUser({ role: 'admin' })
    signInAs({ id: admin.id, email: admin.email, role: 'admin' })

    const response = await exportWeb('bristol')

    expect(response.status).toBe(200)
    expect((await rowsOf(response)).map((r) => r.Name)).toEqual(['Food Hub'])
  })

  it('does not export a deleted web', async () => {
    const web = await createWeb({ slug: 'bristol', deletedAt: new Date() })
    await signInAsEditorOf(web.id)

    const response = await exportWeb('bristol')

    expect(response.status).toBe(404)
  })

  it("downloads every listing in the editor's web, and only that web", async () => {
    const bristol = await createWeb({ slug: 'bristol' })
    const cambridge = await createWeb({ slug: 'cambridge' })
    const food = await createCategory(bristol.id, { label: 'Food' })
    const listing = await createListing(bristol.id, {
      title: 'Food Hub',
      description: '<p>Surplus food, shared</p>',
      website: 'https://foodhub.org',
      categoryId: food.id,
    })
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        email: 'hello@foodhub.org',
        location: { create: { description: '1 Mill Road, Bristol' } },
        socials: {
          create: [{ platform: 'facebook', url: 'https://facebook.com/fh' }],
        },
      },
    })
    await createListing(bristol.id, { title: 'Allotment', pending: true })
    await createListing(bristol.id, { title: 'Bike Kitchen', inactive: true })
    await createListing(cambridge.id, { title: 'Repair Cafe' })
    await signInAsEditorOf(bristol.id)

    const response = await exportWeb('bristol')

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    expect(response.headers.get('Content-Disposition')).toMatch(
      /^attachment; filename="bristol-listings-\d{4}-\d{2}-\d{2}\.csv"$/,
    )

    const rows = await rowsOf(response)
    expect(rows.map((r) => [r.Name, r.Status])).toEqual([
      ['Allotment', 'Pending'],
      ['Bike Kitchen', 'Inactive'],
      ['Food Hub', 'Live'],
    ])
    expect(rows[2]).toMatchObject({
      Description: '<p>Surplus food, shared</p>',
      Email: 'hello@foodhub.org',
      Website: 'https://foodhub.org',
      Address: '1 Mill Road, Bristol',
      Category: 'Food',
      Facebook: 'https://facebook.com/fh',
      Instagram: '',
    })
  })
})
