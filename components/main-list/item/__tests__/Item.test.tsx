import { renderPage } from '@/test/render'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Item from '../Item.tsx'

const dataItem: ListingNodeType = {
  id: 1,
  title: 'Bike Kitchen',
  label: 'Bike Kitchen',
  description: '',
  slug: 'bike-kitchen',
  image: '',
  website: '',
  seekingVolunteers: true,
  featured: null,
  new: false,
  tags: [],
  color: '#b0e3c1',
  category: { label: 'Transportation', color: '#b0e3c1', icon: 'default' },
}

/**
 * The tooltip provider lives once at the app root rather than around each
 * tooltip, so this is what proves an item still gets one.
 */
describe('a listing in the list', () => {
  it('explains the volunteers badge when it is pointed at', async () => {
    const { user } = renderPage(
      <Item categoriesIndexes={{ Transportation: 0 }} dataItem={dataItem} />,
    )

    await user.hover(screen.getByText(/seeking volunteers/i))

    expect(
      await screen.findByRole('tooltip', { name: /seeking volunteers/i }),
    ).toBeInTheDocument()
  })
})
