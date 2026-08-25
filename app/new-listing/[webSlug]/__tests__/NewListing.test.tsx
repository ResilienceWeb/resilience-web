import { stubCategories, recordRequests, stubWeb } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderPage } from '@/test/render'
import { signInAs } from '@/test/session'
import { screen, waitFor, within } from '@testing-library/react'
import { http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import NewListing from '../NewListing.tsx'

/**
 * The form a visitor fills in to propose a listing for a web they don't run.
 * What they submit becomes a pending listing for that web's editors to review,
 * so the test cares about two things: that the form refuses to send an
 * incomplete proposal, and that what it does send is what was typed.
 */

const CATEGORIES = [
  { id: 4, label: 'Community' },
  { id: 7, label: 'Environment' },
]

function proposal() {
  const created = recordRequests({ listing: { slug: 'bike-kitchen' } })
  server.use(http.post('/api/listings', created.resolver))
  return created
}

beforeEach(() => {
  signInAs({ id: 'user-1', email: 'visitor@example.com' })
  server.use(
    stubWeb({ id: 3, title: 'Bristol', slug: 'bristol' }),
    stubCategories(CATEGORIES),
  )
})

/** Fills in everything the form requires, leaving the optional fields alone. */
async function fillInTheRequiredFields(
  user: ReturnType<typeof renderPage>['user'],
  { title = 'Bike Kitchen', description = 'We fix bicycles together.' } = {},
) {
  await user.type(await screen.findByLabelText(/^Title/), title)

  await user.click(screen.getByRole('combobox'))
  await user.click(await screen.findByRole('option', { name: 'Community' }))

  await user.type(screen.getByLabelText(/^Description/), description)
}

/**
 * The page footer carries a newsletter sign-up with a Submit button of its
 * own, so everything the form does is scoped to the form.
 */
const listingForm = () =>
  screen.getByLabelText(/^Title/).closest('form') as HTMLElement

const submit = (user: ReturnType<typeof renderPage>['user']) =>
  user.click(within(listingForm()).getByRole('button', { name: 'Submit' }))

describe('proposing a listing', () => {
  it('tells the visitor which web they are proposing to', async () => {
    renderPage(<NewListing webSlug="bristol" />)

    expect(
      await screen.findByRole('heading', { name: /propose new listing/i }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/Bristol/)).toBeInTheDocument()
  })

  it('offers the categories of the web being proposed to', async () => {
    const { user } = renderPage(<NewListing webSlug="bristol" />)

    await user.click(await screen.findByRole('combobox'))

    expect(
      await screen.findByRole('option', { name: 'Community' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Environment' }),
    ).toBeInTheDocument()
  })

  it('refuses an incomplete proposal and says what is missing', async () => {
    const proposed = proposal()
    const { user } = renderPage(<NewListing webSlug="bristol" />)

    await user.type(await screen.findByLabelText(/^Title/), 'Bike Kitchen')
    await submit(user)

    expect(
      await screen.findByText('Description is required'),
    ).toBeInTheDocument()
    expect(proposed.calls).toHaveLength(0)
  })

  it('refuses a website that is not a link', async () => {
    const proposed = proposal()
    const { user } = renderPage(<NewListing webSlug="bristol" />)

    await fillInTheRequiredFields(user)
    await user.type(screen.getByLabelText('Website'), 'not-a-website')
    await submit(user)

    expect(
      await screen.findByText(/Please enter a valid URL/),
    ).toBeInTheDocument()
    expect(proposed.calls).toHaveLength(0)
  })

  it('sends what the visitor typed, as a proposal for that web', async () => {
    const proposed = proposal()
    const { user } = renderPage(<NewListing webSlug="bristol" />)

    await fillInTheRequiredFields(user)
    await submit(user)

    await waitFor(() => expect(proposed.calls).toHaveLength(1))
    expect(proposed.calls[0].body).toMatchObject({
      title: 'Bike Kitchen',
      description: 'We fix bicycles together.',
      category: '4',
      webId: '3',
      pending: 'true',
      proposerId: 'user-1',
    })
  })

  it('gives the listing a page address based on its title', async () => {
    const { user } = renderPage(<NewListing webSlug="bristol" />)

    await user.type(
      await screen.findByLabelText(/^Title/),
      'Bristol Bike Kitchen',
    )

    expect(screen.getByLabelText(/Link to listing page/)).toHaveValue(
      'bristol-bike-kitchen',
    )
  })

  it('thanks the visitor once the proposal is in', async () => {
    proposal()
    const { user } = renderPage(<NewListing webSlug="bristol" />)

    await fillInTheRequiredFields(user)
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
