import { renderPage } from '@/test/render'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ListingsMap from './ListingsMap'

const ITEMS = [
  {
    id: 1,
    label: 'Sustainable Food',
    slug: 'sustainable-food',
    category: { label: 'Food', color: '#b0e3c1' },
    tags: [],
    location: { latitude: '51.45', longitude: '-2.58' },
  },
]

describe('ListingsMap', () => {
  // iPhone Safari has no element fullscreen API, and neither does jsdom.
  it('keeps the map working when the browser cannot go fullscreen', async () => {
    const { user } = renderPage(
      <ListingsMap items={ITEMS} categories={[{ label: 'Food' }]} />,
    )

    const button = await screen.findByRole('button', { name: 'Fullscreen' })
    await user.click(button)

    expect(
      screen.getByRole('button', { name: 'Fullscreen' }),
    ).toBeInTheDocument()
  })
})
