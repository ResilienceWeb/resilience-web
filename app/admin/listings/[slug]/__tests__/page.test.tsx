import { listing } from '@/test/fixtures/listing'
import {
  recordRequests,
  stubCategories,
  stubListingEdits,
  stubListings,
  stubTags,
  stubWeb,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { router } from '@/test/next-navigation'
import { renderPage } from '@/test/render'
import { act, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ListingPage from '../page.tsx'

// Toasts render into a <Toaster> that the page doesn't mount by itself
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

/**
 * An editor changing a listing in their web and pressing Update.
 */

const params = Promise.resolve({ slug: 'bike-kitchen' })

// The admin form reads the category from the flattened `categoryId`.
const showListing = (shown: Listing) =>
  server.use(
    http.get('/api/listings/:slug', () =>
      HttpResponse.json({ listing: { ...shown, categoryId: 4 } }),
    ),
  )

const renderListingPage = async () =>
  act(async () => {
    const rendered = renderPage(<ListingPage params={params} />, {
      selectedWeb: { slug: 'bristol', id: 3 },
    })
    await params
    return rendered
  })

beforeEach(() => {
  window.history.pushState({}, '', '/admin')
  window.history.pushState({}, '', '/admin/listings/bike-kitchen')
  server.use(
    stubWeb({ id: 3, title: 'Bristol', slug: 'bristol' }),
    stubCategories([{ id: 4, label: 'Community' }]),
    stubTags([]),
    stubListings([]),
    stubListingEdits([]),
  )
})

describe('updating a listing', () => {
  it('saves a listing whose location was stored without a description', async () => {
    showListing(
      listing({
        id: 12,
        slug: 'bike-kitchen',
        location: {
          latitude: 52.18,
          longitude: 0.22,
          description: null,
          noPhysicalLocation: false,
        },
      }),
    )
    const updated = recordRequests({ listing: { slug: 'bike-kitchen' } })
    server.use(http.put('/api/listings/:slug', updated.resolver))
    const { user } = await renderListingPage()

    await user.click(await screen.findByRole('button', { name: 'Update' }))

    await waitFor(() => expect(updated.calls).toHaveLength(1))
    await waitFor(() => expect(router.back).toHaveBeenCalled())
  })

  it('stays on the page and says so when the update is refused', async () => {
    showListing(listing({ id: 12, slug: 'bike-kitchen' }))
    server.use(
      http.put(
        '/api/listings/:slug',
        () =>
          new HttpResponse('Listing not found in this web', { status: 404 }),
      ),
    )
    const { user } = await renderListingPage()

    await user.click(await screen.findByRole('button', { name: 'Update' }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Listing not found in this web'),
      ),
    )
    expect(router.back).not.toHaveBeenCalled()
  })
})
