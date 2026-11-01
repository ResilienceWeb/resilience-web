import { server } from '@/test/msw/server'
import { renderPage } from '@/test/render'
import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import ListingEditsPage from '../page.tsx'

/**
 * The web's queue of suggested edits. Each pending suggestion has to lead
 * somewhere the team can accept or reject it, otherwise it sits here and
 * keeps the listing locked.
 */

function stubListingEditsForWeb(listingEdits: unknown[]) {
  server.use(
    http.get('/api/webs/:slug/listing-edits', () =>
      HttpResponse.json({ listingEdits }),
    ),
  )
}

const edit = (overrides: Record<string, unknown>) => ({
  id: 1,
  accepted: false,
  createdAt: '2026-10-01T10:00:00.000Z',
  user: { name: 'Sam', email: 'sam@example.com' },
  listing: { id: 12, title: 'Bike Kitchen', slug: 'bike-kitchen' },
  ...overrides,
})

const rowFor = async (title: string) =>
  (await screen.findByText(title)).closest('tr') as HTMLElement

describe('suggested edits', () => {
  it('links a pending suggestion to its review screen', async () => {
    stubListingEditsForWeb([edit({})])

    renderPage(<ListingEditsPage />, { selectedWeb: { slug: 'bristol' } })

    const review = within(await rowFor('Bike Kitchen')).getByRole('link', {
      name: 'Review',
    })
    expect(review).toHaveAttribute('href', '/admin/listings/bike-kitchen/edits')
  })

  it('has nothing to review once a suggestion is accepted', async () => {
    stubListingEditsForWeb([edit({ accepted: true })])

    renderPage(<ListingEditsPage />, { selectedWeb: { slug: 'bristol' } })

    expect(
      within(await rowFor('Bike Kitchen')).queryByRole('link'),
    ).not.toBeInTheDocument()
  })
})
