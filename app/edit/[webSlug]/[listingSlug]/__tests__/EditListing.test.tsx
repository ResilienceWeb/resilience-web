import { listing } from '@/test/fixtures/listing'
import {
  recordRequests,
  stubCategories,
  stubListingEdits,
  stubWeb,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { router } from '@/test/next-navigation'
import { renderPage } from '@/test/render'
import { screen, waitFor, within } from '@testing-library/react'
import { http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import EditListing from '../EditListing.tsx'

/**
 * The form anyone can use to suggest a change to an existing listing. Nothing
 * they type reaches the listing directly — it becomes a `ListingEdit` for the
 * web's editors to accept or reject — so what matters here is that the form
 * arrives filled in with the listing as it stands, and that a suggestion is
 * sent for the right listing.
 */

const LISTING = listing({
  id: 12,
  title: 'Bike Kitchen',
  description: 'A workshop where volunteers help you fix your own bicycle.',
  website: 'https://bikekitchen.org',
})

function suggestion() {
  const suggested = recordRequests({ listing: LISTING })
  server.use(http.post('/api/listings/:slug/edit', suggested.resolver))
  return suggested
}

const editForm = () =>
  screen.getByLabelText(/^Title/).closest('form') as HTMLElement

/** The page footer has a newsletter Submit of its own, so scope to the form. */
const submit = (user: ReturnType<typeof renderPage>['user']) =>
  user.click(within(editForm()).getByRole('button', { name: 'Submit' }))

const renderEditPage = () =>
  renderPage(<EditListing listing={LISTING} webSlug="bristol" />)

beforeEach(() => {
  server.use(
    stubWeb({ id: 3, title: 'Bristol', slug: 'bristol' }),
    stubCategories([
      { id: 4, label: 'Community' },
      { id: 7, label: 'Environment' },
    ]),
    stubListingEdits([]),
  )
})

describe('suggesting an edit to a listing', () => {
  it('arrives filled in with the listing as it stands', async () => {
    renderEditPage()

    expect(await screen.findByLabelText(/^Title/)).toHaveValue('Bike Kitchen')
    expect(screen.getByLabelText('Website')).toHaveValue(
      'https://bikekitchen.org',
    )
    expect(screen.getByLabelText(/^Description/)).toHaveValue(
      'A workshop where volunteers help you fix your own bicycle.',
    )
  })

  it('says the changes go to the web maintainers for review', async () => {
    renderEditPage()

    expect(
      await screen.findByText(/will be submitted to the maintainers/i),
    ).toBeInTheDocument()
  })

  it('does not let the listing move to a different page address', async () => {
    renderEditPage()

    await screen.findByLabelText(/^Title/)
    expect(screen.queryByLabelText(/Link to listing page/)).toBeNull()
  })

  it('refuses to suggest a listing with no title', async () => {
    const suggested = suggestion()
    const { user } = renderEditPage()

    await user.clear(await screen.findByLabelText(/^Title/))
    await submit(user)

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
    expect(suggested.calls).toHaveLength(0)
  })

  it('sends the change against the listing it was opened for', async () => {
    const suggested = suggestion()
    const { user } = renderEditPage()

    const title = await screen.findByLabelText(/^Title/)
    await user.clear(title)
    await user.type(title, 'Bristol Bike Kitchen')
    await submit(user)

    await waitFor(() => expect(suggested.calls).toHaveLength(1))
    expect(suggested.calls[0].url.pathname).toBe(
      '/api/listings/bike-kitchen/edit',
    )
    expect(suggested.calls[0].url.searchParams.get('web')).toBe('bristol')
    expect(suggested.calls[0].body).toMatchObject({
      title: 'Bristol Bike Kitchen',
      listingId: '12',
      webId: '3',
    })
  })

  it('thanks the contributor once the suggestion is in', async () => {
    suggestion()
    const { user } = renderEditPage()

    const title = await screen.findByLabelText(/^Title/)
    await user.clear(title)
    await user.type(title, 'Bristol Bike Kitchen')
    await submit(user)

    expect(
      await screen.findByRole(
        'heading',
        { name: /thank you/i },
        { timeout: 3000 },
      ),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText(/^Title/)).toBeNull()
  })
})

describe('a listing that is already under review', () => {
  it('cannot be edited again until the first suggestion is dealt with', async () => {
    server.use(stubListingEdits([{ id: 90, title: 'Bristol Bike Kitchen' }]))
    renderEditPage()

    expect(
      await screen.findByText(/already a suggested edit under review/i),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText(/^Title/)).toBeNull()
  })

  it('sends the visitor back to the listing they came from', async () => {
    server.use(stubListingEdits([{ id: 90 }]))
    const { user } = renderEditPage()

    await user.click(
      await screen.findByRole('button', { name: /go back to listing/i }),
    )

    expect(router.back).toHaveBeenCalled()
  })
})
