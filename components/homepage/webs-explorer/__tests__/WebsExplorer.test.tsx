import { renderPage } from '@/test/render'
import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import WebsExplorer from '../WebsExplorer.tsx'

// Leaflet needs a real browser to lay out the map; the list beside it is what
// people search and read
vi.mock('../WebsMap', () => ({ default: () => null }))

const web = (
  title: string,
  description: string | null,
  image = 'x.jpg',
  publishedAt: string | Date = '2020-01-01',
) => ({
  id: title.length,
  title,
  slug: title.toLowerCase().replace(/\s+/g, '-'),
  image,
  publishedAt,
  _count: { listings: 12 },
  location: description ? { latitude: 52, longitude: 0, description } : null,
})

const WEBS = [
  web(
    'Ely',
    'Ely, East Cambridgeshire, Cambridgeshire, Cambridgeshire and Peterborough, England, United Kingdom',
  ),
  web(
    'Bristol',
    'Bristol, City of Bristol, West of England, England, United Kingdom',
  ),
  web('Anglia Ruskin University', null),
  web('Draft web', 'Leeds, England', null),
]

const listedWebs = () =>
  within(screen.getByRole('list', { name: 'Resilience Webs' }))
    .getAllByRole('link')
    .map((link) => link.textContent)

describe('finding a web on the homepage', () => {
  it('lists the webs alphabetically, leaving out ones without a picture yet', () => {
    renderPage(<WebsExplorer webs={WEBS} />)

    expect(listedWebs()).toEqual(['Anglia Ruskin University', 'Bristol', 'Ely'])
  })

  it('puts recently launched webs at the top', () => {
    renderPage(
      <WebsExplorer
        webs={[...WEBS, web('Zennor', null, 'x.jpg', new Date())]}
      />,
    )

    expect(listedWebs()).toEqual([
      'Zennor',
      'Anglia Ruskin University',
      'Bristol',
      'Ely',
    ])
  })

  it('shows where each web is, without the full postal address', () => {
    renderPage(<WebsExplorer webs={WEBS} />)

    expect(screen.getByText('Ely, England')).toBeInTheDocument()
  })

  it('finds webs by the county they are in', async () => {
    const { user } = renderPage(<WebsExplorer webs={WEBS} />)

    await user.type(
      screen.getByRole('searchbox', { name: 'Search webs' }),
      'cambridgeshire',
    )

    expect(listedWebs()).toEqual(['Ely'])
  })

  it('says so when nothing matches', async () => {
    const { user } = renderPage(<WebsExplorer webs={WEBS} />)

    await user.type(
      screen.getByRole('searchbox', { name: 'Search webs' }),
      'atlantis',
    )

    expect(screen.getByText(/No webs match “atlantis”/)).toBeInTheDocument()
  })

  it('only offers to show webs on the map when they have a location', () => {
    renderPage(<WebsExplorer webs={WEBS} />)

    expect(
      screen.getByRole('button', { name: 'Show Bristol on the map' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Show Anglia Ruskin University/ }),
    ).not.toBeInTheDocument()
  })
})
