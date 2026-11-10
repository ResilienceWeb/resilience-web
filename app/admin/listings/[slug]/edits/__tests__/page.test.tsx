import { listing } from '@/test/fixtures/listing'
import { stubCategories, stubTags, stubWeb } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { router } from '@/test/next-navigation'
import { renderPage } from '@/test/render'
import { act, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import ListingPage from '../../page.tsx'
import ListingEditsPage from '../page.tsx'

/**
 * An editor accepting a suggested edit, then landing on the listing's own admin
 * page. Both pages share one query cache, as they do in the browser, so what the
 * second page shows depends on what accepting left behind.
 */

const CURRENT = listing({ id: 12, slug: 'bike-kitchen', title: 'Bike Kitchen' })
const SUGGESTED = {
  ...listing({ id: 12, slug: 'bike-kitchen', title: 'Bristol Bike Kitchen' }),
  id: 99,
  user: { email: 'visitor@example.com' },
}

let pendingEdits: unknown[]

beforeEach(() => {
  pendingEdits = [SUGGESTED]
  server.use(
    stubWeb({ id: 3, title: 'Bristol', slug: 'bristol' }),
    stubCategories([{ id: 4, label: 'Community' }]),
    stubTags([]),
    http.get('/api/listings/:slug', () =>
      HttpResponse.json({ listing: CURRENT }),
    ),
    http.get('/api/listings/:slug/edit', () =>
      HttpResponse.json({ listingEdits: pendingEdits }),
    ),
    http.post('/api/listing/:id/apply-edit', () => {
      pendingEdits = []
      return HttpResponse.json({ listing: CURRENT })
    }),
  )
})

const params = Promise.resolve({ slug: 'bike-kitchen' })

describe('accepting a suggested edit', () => {
  it('leaves the listing editable on the page it redirects to', async () => {
    // The pages read their params with `use()`, so they suspend until it resolves.
    const { user, rerender } = await act(async () => {
      const rendered = renderPage(<ListingEditsPage params={params} />, {
        selectedWeb: { slug: 'bristol', id: 3 },
      })
      await params
      return rendered
    })

    await user.click(
      await screen.findByRole('button', { name: 'Accept changes' }),
    )
    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith(
        '/admin/listings/bike-kitchen?editApplied=true',
      ),
    )

    await act(async () => {
      rerender(<ListingPage params={params} />)
      await params
    })

    expect(screen.queryByText(/cannot be edited/i)).not.toBeInTheDocument()
    expect(await screen.findByLabelText(/^Title/)).toHaveValue('Bike Kitchen')
    expect(screen.queryByText(/cannot be edited/i)).not.toBeInTheDocument()
  })
})
