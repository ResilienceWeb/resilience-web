import {
  stubCategories,
  stubListings,
  stubTags,
  stubWeb,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderPage } from '@/test/render'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NewListingPage from '../page.tsx'

// Toasts render into a <Toaster> that the page doesn't mount by itself
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

/**
 * The form an editor uses to add a listing to the web they run.
 */

beforeEach(() => {
  server.use(
    stubWeb({ id: 3, title: 'Bristol', slug: 'bristol' }),
    stubCategories([{ id: 4, label: 'Community' }]),
    stubTags([]),
    stubListings([]),
  )
})

describe('adding a listing', () => {
  it('fills in the link to the listing page from the title', async () => {
    const { user } = renderPage(<NewListingPage />, {
      selectedWeb: { id: 3, slug: 'bristol' },
    })

    await user.type(await screen.findByLabelText(/^Title/), 'The Bike Kitchen')

    expect(screen.getByLabelText(/Link to listing page/)).toHaveValue(
      'the-bike-kitchen',
    )
  })

  it('replaces the empty state once an action button is added', async () => {
    const { user } = renderPage(<NewListingPage />, {
      selectedWeb: { id: 3, slug: 'bristol' },
    })

    await user.click(
      await screen.findByRole('button', { name: /Add Action Button/ }),
    )

    expect(
      screen.queryByText('No action buttons added'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Action Type')).toBeInTheDocument()
  })

  it('replaces the empty state once a social media link is added', async () => {
    const { user } = renderPage(<NewListingPage />, {
      selectedWeb: { id: 3, slug: 'bristol' },
    })

    await user.click(
      await screen.findByRole('button', { name: /Add Social Media link/ }),
    )

    expect(
      screen.queryByText('No social media links added'),
    ).not.toBeInTheDocument()
  })
})

describe('tagging a listing', () => {
  const openTagPicker = async () => {
    const rendered = renderPage(<NewListingPage />, {
      selectedWeb: { id: 3, slug: 'bristol' },
    })
    await rendered.user.click(
      await screen.findByText('Select or start typing to create tag...'),
    )
    return rendered
  }

  it('offers the web tags and the shared tags, but not retired ones', async () => {
    server.use(
      stubTags([
        { id: 1, label: 'Bristol only', webId: 3 },
        { id: 2, label: 'Food Bank', webId: null, key: 'food-bank' },
        {
          id: 3,
          label: 'Retired',
          webId: null,
          key: 'retired',
          retiredAt: '2026-10-01T00:00:00.000Z',
        },
      ]),
    )
    await openTagPicker()

    expect(
      await screen.findByRole('option', { name: 'Bristol only' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Food Bank' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Retired' })).toBeNull()
  })

  it("says why a tag can't be created with a shared tag's name", async () => {
    server.use(
      http.post('/api/tags', () =>
        HttpResponse.json(
          { error: '"Retired" is already a shared tag' },
          { status: 409 },
        ),
      ),
    )
    const { user } = await openTagPicker()

    await user.type(screen.getByPlaceholderText('Search...'), 'retired')
    await user.click(
      await screen.findByRole('option', { name: 'Create tag "retired"' }),
    )

    expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
      '"Retired" is already a shared tag',
    )
  })
})
