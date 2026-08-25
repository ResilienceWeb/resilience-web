import { listing } from '@/test/fixtures/listing'
import {
  recordRequests,
  stubCanEditWeb,
  stubCategories,
  stubWeb,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderPage } from '@/test/render'
import { signInAs } from '@/test/session'
import { screen, waitFor, within } from '@testing-library/react'
import { http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EditableList from '../EditableList.tsx'

/**
 * The table an editor lands on in the admin: every listing in their web, with
 * the ones that need attention first and the handful of things they can do to
 * one without opening it.
 */

const LISTINGS = [
  listing({ id: 1, title: 'Bike Kitchen', category: { label: 'Transport' } }),
  listing({ id: 2, title: 'Repair Cafe', category: { label: 'Community' } }),
  listing({
    id: 3,
    title: 'Wild Swimming',
    category: { label: 'Community' },
  }),
]

const ALL_TITLES = LISTINGS.map((l) => l.title)

function renderList(
  { items = LISTINGS, searchParams = {} } = {},
  deleteListing = vi.fn(),
) {
  return {
    deleteListing,
    ...renderPage(
      <EditableList items={items} deleteListing={deleteListing} />,
      {
        selectedWeb: { slug: 'bristol', id: 3 },
        searchParams,
      },
    ),
  }
}

/** A listing has a row of its own, named after its title. */
const row = (title: string) =>
  screen.queryByRole('row', { name: new RegExp(title) })

const expectListed = (titles: string[]) =>
  titles.forEach((title) => expect(row(title)).toBeInTheDocument())

const expectNotListed = (titles: string[]) =>
  titles.forEach((title) => expect(row(title)).toBeNull())

beforeEach(() => {
  signInAs({ id: 'editor-1', email: 'editor@example.com' })
  server.use(
    stubCanEditWeb(true),
    stubWeb({ id: 3, slug: 'bristol' }),
    stubCategories([
      { id: 1, label: 'Transport' },
      { id: 2, label: 'Community' },
    ]),
  )
})

describe('the admin listings table', () => {
  it('lists every listing in the web', async () => {
    renderList()

    await waitFor(() => expectListed(ALL_TITLES))
  })

  it('narrows the table as the editor types', async () => {
    const { user } = renderList()
    await waitFor(() => expectListed(ALL_TITLES))

    await user.type(await screen.findByPlaceholderText('Search'), 'repair')

    expectListed(['Repair Cafe'])
    expectNotListed(['Bike Kitchen', 'Wild Swimming'])
  })

  it('shows only the chosen category, and restores the rest afterwards', async () => {
    const { user } = renderList()
    await waitFor(() => expectListed(ALL_TITLES))

    await user.click(await screen.findByText('Filter by category'))
    await user.click(await screen.findByRole('option', { name: 'Community' }))
    await user.keyboard('{Escape}')

    await waitFor(() => expectNotListed(['Bike Kitchen']))
    expectListed(['Repair Cafe', 'Wild Swimming'])

    await user.click(screen.getByRole('button', { name: 'Remove Community' }))

    await waitFor(() => expectListed(ALL_TITLES))
  })

  it('starts filtered when the URL already names a category', async () => {
    renderList({ searchParams: { categories: 'Transport' } })

    await waitFor(() => expectListed(['Bike Kitchen']))
    expectNotListed(['Repair Cafe', 'Wild Swimming'])
  })

  it('says so when nothing matches, and offers a way to add one', async () => {
    const { user } = renderList()
    await waitFor(() => expectListed(ALL_TITLES))

    await user.type(
      await screen.findByPlaceholderText('Search'),
      'nothing matches this',
    )

    expect(screen.getByText(/No listings yet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start adding/i })).toHaveAttribute(
      'href',
      '/admin/new-listing',
    )
  })

  it('puts what needs attention first', async () => {
    renderList({
      items: [
        listing({ id: 1, title: 'Bike Kitchen' }),
        listing({ id: 2, title: 'Repair Cafe', pending: true }),
        listing({ id: 3, title: 'Wild Swimming', edits: [{ id: 90 }] }),
      ],
    })

    await waitFor(() => expectListed(ALL_TITLES))
    const titles = screen
      .getAllByRole('row')
      .slice(1)
      .map((r) => r.textContent)

    expect(titles[0]).toContain('Wild Swimming')
    expect(titles[1]).toContain('Repair Cafe')
    expect(titles[2]).toContain('Bike Kitchen')
  })

  it('marks a proposed listing as pending and sends the editor to review it', async () => {
    renderList({
      items: [listing({ id: 1, title: 'Bike Kitchen', pending: true })],
    })

    const bikeKitchen = within(
      await screen.findByRole('row', { name: /Bike Kitchen/ }),
    )
    expect(bikeKitchen.getByText('Pending')).toBeInTheDocument()
    expect(bikeKitchen.getByRole('link', { name: 'Review' })).toHaveAttribute(
      'href',
      '/admin/listings/bike-kitchen',
    )
  })

  it('offers a way through to a suggested edit', async () => {
    renderList({
      items: [listing({ id: 1, title: 'Bike Kitchen', edits: [{ id: 90 }] })],
    })

    const bikeKitchen = within(
      await screen.findByRole('row', { name: /Bike Kitchen/ }),
    )
    expect(
      bikeKitchen.getByRole('link', { name: /view suggested edit/i }),
    ).toHaveAttribute('href', '/admin/listings/bike-kitchen/edits')
  })

  it('flags a listing that is missing an image, a location or a real description', async () => {
    renderList({
      items: [
        listing({ id: 1, title: 'Bike Kitchen', description: 'Too short.' }),
      ],
    })

    const bikeKitchen = within(
      await screen.findByRole('row', { name: /Bike Kitchen/ }),
    )
    expect(bikeKitchen.getByText('No image')).toBeInTheDocument()
    expect(bikeKitchen.getByText('No location')).toBeInTheDocument()
    expect(bikeKitchen.getByText('Short description')).toBeInTheDocument()
  })
})

describe('featuring a listing', () => {
  const inTheFuture = '2099-01-01T00:00:00.000Z'

  it('lifts a listing to the top of the web page for a while', async () => {
    const featured = recordRequests({ listing: {} })
    server.use(http.patch('*/api/listing/:id/feature', featured.resolver))

    const { user } = renderList({
      items: [listing({ id: 7, title: 'Bike Kitchen' })],
    })

    await user.click(
      await screen.findByRole('button', { name: 'Feature Bike Kitchen' }),
    )

    await waitFor(() => expect(featured.calls).toHaveLength(1))
    expect(featured.calls[0].url.pathname).toBe('/api/listing/7/feature')
    expect(featured.calls[0].body).toMatchObject({ webId: 3 })
  })

  it('takes an already-featured listing back down', async () => {
    const unfeatured = recordRequests({ listing: {} })
    server.use(http.patch('*/api/listing/:id/unfeature', unfeatured.resolver))

    const { user } = renderList({
      items: [listing({ id: 7, title: 'Bike Kitchen', featured: inTheFuture })],
    })

    await user.click(
      await screen.findByRole('button', { name: 'Unfeature Bike Kitchen' }),
    )

    await waitFor(() => expect(unfeatured.calls).toHaveLength(1))
    expect(unfeatured.calls[0].url.pathname).toBe('/api/listing/7/unfeature')
  })

  it('treats a listing whose spell in the spotlight has passed as not featured', async () => {
    renderList({
      items: [
        listing({
          id: 7,
          title: 'Bike Kitchen',
          featured: '2020-01-01T00:00:00.000Z',
        }),
      ],
    })

    expect(
      await screen.findByRole('button', { name: 'Feature Bike Kitchen' }),
    ).toBeInTheDocument()
  })
})

describe('removing a listing', () => {
  it('asks before deleting, and deletes what was asked for', async () => {
    const { user, deleteListing } = renderList({
      items: [listing({ id: 7, title: 'Bike Kitchen' })],
    })

    await user.click(await screen.findByRole('button', { name: 'Remove' }))

    expect(
      await screen.findByText(/can't be recovered once deleted/i),
    ).toBeInTheDocument()
    expect(deleteListing).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Yes, delete' }))

    expect(deleteListing).toHaveBeenCalledWith({
      slug: 'bike-kitchen',
      webId: 3,
    })
  })

  it('lets the editor change their mind', async () => {
    const { user, deleteListing } = renderList({
      items: [listing({ id: 7, title: 'Bike Kitchen' })],
    })

    await user.click(await screen.findByRole('button', { name: 'Remove' }))
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(deleteListing).not.toHaveBeenCalled()
  })

  it('explains that a shared listing only leaves this web', async () => {
    const { user } = renderList({
      items: [
        listing({
          id: 7,
          title: 'Bike Kitchen',
          sharedWith: [{ web: { title: 'Bath' } }],
        }),
      ],
    })

    await user.click(await screen.findByRole('button', { name: 'Remove' }))

    expect(
      await screen.findByText(/It will stay listed in Bath/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Yes, remove' }),
    ).toBeInTheDocument()
  })
})

describe('someone who may not edit this web', () => {
  it('is not offered the search, the filter or a way to add a listing', async () => {
    server.use(stubCanEditWeb(false))
    renderList()

    await waitFor(() => expectListed(ALL_TITLES))
    expect(screen.queryByPlaceholderText('Search')).toBeNull()
    expect(screen.queryByText('Filter by category')).toBeNull()
    expect(screen.queryByRole('button', { name: /new listing/i })).toBeNull()
  })
})
