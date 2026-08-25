import { listing, type ListingFixtureOverrides } from '@/test/fixtures/listing'
import { recordRequests } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { router } from '@/test/next-navigation'
import { renderPage } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import { http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import ListingEditReview from '../ListingEditReview.tsx'

/**
 * What a web editor sees when someone has suggested a change to one of their
 * listings: the listing as it stands with the suggestion marked on top of it,
 * and the two decisions they can make about it.
 *
 * The review is deliberately a diff rather than a preview of the result — an
 * editor has to be able to tell what would change, including that a field they
 * care about would be emptied.
 */

const CURRENT_SPEC: ListingFixtureOverrides = {
  id: 12,
  title: 'Bike Kitchen',
  description: 'Volunteers help you fix your own bicycle.',
  website: 'https://bikekitchen.org',
  tags: [
    { id: 1, label: 'Volunteer-run' },
    { id: 2, label: 'Free' },
  ],
  socials: [
    { platform: 'instagram', url: 'https://instagram.com/bikekitchen' },
  ],
  actions: [{ type: 'donate', url: 'https://bikekitchen.org/donate' }],
}

const CURRENT = listing(CURRENT_SPEC)

/** The listing as the suggestion would leave it. */
const suggesting = (changes: ListingFixtureOverrides) =>
  listing({ ...CURRENT_SPEC, ...changes })

function renderReview(editedListing: Listing, { onAccept = vi.fn() } = {}) {
  return {
    onAccept,
    ...renderPage(
      <ListingEditReview
        listing={CURRENT}
        editedListing={editedListing}
        handleSubmit={onAccept}
        webSlug="bristol"
      />,
    ),
  }
}

/** A field's section, found by the heading the review gives it. */
const section = (label: string) =>
  screen.getByRole('heading', { name: label }).parentElement

describe('the suggested-edit review', () => {
  it('shows the old and the new wording side by side', () => {
    renderReview(
      suggesting({
        title: 'Bristol Bike Kitchen',
        description: 'Volunteers help you fix your own bicycle every Sunday.',
      }),
    )

    expect(section('Title')).toHaveTextContent('Bristol')
    expect(section('Title')).toHaveTextContent('Bike Kitchen')
    expect(section('Description')).toHaveTextContent('every Sunday')
  })

  it('leaves out the fields the suggestion does not touch', () => {
    renderReview(suggesting({ title: 'Bristol Bike Kitchen' }))

    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Description' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Website' })).toBeNull()
    expect(
      screen.queryByRole('heading', {
        name: 'Contact email for organisation',
      }),
    ).toBeNull()
  })

  it('spells out that a field would be emptied', () => {
    renderReview(suggesting({ website: '' }))

    expect(section('Website')).toHaveTextContent('https://bikekitchen.org')
    expect(section('Website')).toHaveTextContent('(deleted)')
  })

  it('shows which tags would be added, removed and left alone', () => {
    renderReview(
      suggesting({
        tags: [
          { id: 1, label: 'Volunteer-run' },
          { id: 5, label: 'Repair' },
        ],
      }),
    )

    expect(section('Tags')).toHaveTextContent('Added:+ Repair')
    expect(section('Tags')).toHaveTextContent('Removed:Free')
    expect(section('Tags')).toHaveTextContent('Unchanged:Volunteer-run')
  })

  it('says nothing about tags when they are untouched', () => {
    renderReview(suggesting({ title: 'Bristol Bike Kitchen' }))

    expect(screen.queryByRole('heading', { name: 'Tags' })).toBeNull()
  })

  it('shows a social media link that would be replaced', () => {
    renderReview(
      suggesting({
        socials: [
          { platform: 'instagram', url: 'https://instagram.com/bristolbikes' },
        ],
      }),
    )

    expect(
      screen.getByText('https://instagram.com/bikekitchen'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('https://instagram.com/bristolbikes'),
    ).toBeInTheDocument()
  })

  it('marks a social media link that would be dropped as removed', () => {
    renderReview(suggesting({ socials: [] }))

    expect(screen.getByText('(removed)')).toBeInTheDocument()
    expect(
      screen.getByText('https://instagram.com/bikekitchen'),
    ).toBeInTheDocument()
  })

  it('marks a new action button as added', () => {
    renderReview(
      suggesting({
        actions: [
          { type: 'donate', url: 'https://bikekitchen.org/donate' },
          { type: 'volunteer', url: 'https://bikekitchen.org/volunteer' },
        ],
      }),
    )

    expect(
      screen.getByText('https://bikekitchen.org/volunteer'),
    ).toBeInTheDocument()
    expect(screen.getByText('(added)')).toBeInTheDocument()
  })
})

describe('deciding on a suggested edit', () => {
  it('applies the suggestion when the editor accepts it', async () => {
    const { user, onAccept } = renderReview(
      suggesting({ title: 'Bristol Bike Kitchen' }),
    )

    await user.click(screen.getByRole('button', { name: /accept changes/i }))

    expect(onAccept).toHaveBeenCalled()
  })

  it('throws the suggestion away when the editor rejects it', async () => {
    const rejected = recordRequests({})
    server.use(http.delete('/api/listings/:slug/edit', rejected.resolver))

    const { user, onAccept } = renderReview(
      suggesting({ title: 'Bristol Bike Kitchen' }),
    )

    await user.click(screen.getByRole('button', { name: 'Reject' }))

    await waitFor(() => expect(rejected.calls).toHaveLength(1))
    expect(rejected.calls[0].url.pathname).toBe(
      '/api/listings/bike-kitchen/edit',
    )
    expect(rejected.calls[0].url.searchParams.get('web')).toBe('bristol')
    expect(onAccept).not.toHaveBeenCalled()
    expect(router.back).toHaveBeenCalled()
  })
})
