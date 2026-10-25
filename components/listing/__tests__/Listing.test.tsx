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

describe("a listing page's tags", () => {
  it("show the tag's icon in place of the '#', which a tag without one keeps", () => {
    renderPage(
      <Listing
        listing={{
          ...listing({ title: 'Food Hub' }),
          web: { id: 1, slug: 'bristol', title: 'Bristol' },
          tags: [
            { id: 1, label: 'Food aid', icon: 'gm:food-bank' },
            { id: 2, label: 'Free', icon: null },
          ],
        }}
        categories={[]}
      />,
    )

    const iconOf = (chip: HTMLElement) =>
      chip.querySelector('image')?.getAttribute('href')

    expect(iconOf(screen.getByRole('link', { name: 'Food aid' }))).toBe(
      '/icons/green-map/food-bank.svg',
    )
    expect(iconOf(screen.getByRole('link', { name: '#Free' }))).toBeUndefined()
  })

  it('draw the icon in the colour of the label, not its own', () => {
    renderPage(
      <Listing
        listing={{
          ...listing({ title: 'Food Hub' }),
          web: { id: 1, slug: 'bristol', title: 'Bristol' },
          tags: [{ id: 1, label: 'Food aid', icon: 'gm:food-bank' }],
        }}
        categories={[]}
      />,
    )

    const chip = screen.getByRole('link', { name: 'Food aid' })
    expect(chip.querySelector('rect')).toHaveAttribute('fill', 'currentColor')
  })
})
