import { listing } from '@/test/fixtures/listing'
import { renderPage } from '@/test/render'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Listing from '../Listing.tsx'

vi.mock('@helpers/analytics', () => ({ trackListingEvent: vi.fn() }))

describe('a listing page', () => {
  it('links to the listing in the other webs it is part of', () => {
    renderPage(
      <Listing
        listing={{
          ...listing({ title: 'Food Hub' }),
          web: { id: 1, slug: 'bristol', title: 'Bristol' },
          alsoListedIn: [
            { slug: 'hub-in-bath', web: { slug: 'bath', title: 'Bath' } },
            { slug: 'hub', web: { slug: 'cardiff', title: 'Cardiff' } },
          ],
        }}
        categories={[]}
      />,
    )

    expect(screen.getByText(/also on/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Bath' })).toHaveAttribute(
      'href',
      expect.stringMatching(/bath\..*\/hub-in-bath$/),
    )
    expect(screen.getByRole('link', { name: 'Cardiff' })).toBeInTheDocument()
  })
})
