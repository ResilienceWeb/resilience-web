import {
  stubCategories,
  stubListings,
  stubTags,
  stubWeb,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderPage } from '@/test/render'
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import NewListingPage from '../page.tsx'

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
