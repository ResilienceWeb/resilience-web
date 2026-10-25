import {
  recordRequests,
  stubCategories,
  stubListings,
  stubTags,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderPage } from '@/test/render'
import * as Sentry from '@sentry/nextjs'
import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CategoriesPage from '../page.tsx'

/**
 * The screen where an editor shapes the vocabulary of their web: the
 * categories every listing must belong to, and the tags that cut across them.
 *
 * Both halves are the same three actions — create, rename, delete — with one
 * rule that matters: neither can be deleted while listings still use it.
 */

const CATEGORIES = [
  { id: 1, label: 'Community', color: 'b0e3c1', _count: { listings: 2 } },
  { id: 2, label: 'Transport', color: 'ffd6a5', _count: { listings: 0 } },
]

const TAGS = [
  { id: 5, label: 'Volunteer-run', webId: 3, _count: { listings: 0 } },
  {
    id: 6,
    label: 'Free',
    icon: 'gm:food-bank',
    webId: 3,
    _count: { listings: 1 },
  },
  // Shared tags: the web's listings use the first, not the second
  {
    id: 7,
    label: 'Food Bank',
    key: 'food-bank',
    webId: null,
    _count: { listings: 2 },
  },
  {
    id: 8,
    label: 'Cycling',
    key: 'cycling',
    webId: null,
    _count: { listings: 0 },
  },
]

const renderCategoriesPage = () =>
  renderPage(<CategoriesPage />, { selectedWeb: { slug: 'bristol', id: 3 } })

/** The table row for one category or tag, named after its label. */
const rowFor = (label: string) =>
  screen.getByRole('row', { name: new RegExp(`^${label}\\b`) })

const openTagsTab = (user: ReturnType<typeof renderPage>['user']) =>
  user.click(screen.getByRole('tab', { name: 'Tags' }))

beforeEach(() => {
  server.use(
    stubCategories(CATEGORIES),
    stubTags(TAGS),
    stubListings([
      {
        id: 1,
        title: 'Bike Kitchen',
        tags: [{ id: 7, label: 'Food Bank' }],
        placements: [{ id: 101 }],
      },
      { id: 2, title: 'Seed Library', tags: [], placements: [{ id: 102 }] },
    ]),
  )
})

describe('which tab is open', () => {
  it('is kept in the URL, so a refresh stays on it', async () => {
    const urls: URLSearchParams[] = []
    const { user } = renderPage(<CategoriesPage />, {
      selectedWeb: { slug: 'bristol', id: 3 },
      onUrlUpdate: ({ searchParams }) => urls.push(searchParams),
    })

    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(user)

    await waitFor(() => expect(urls.at(-1)?.get('tab')).toBe('tags'))
  })

  it('opens on the tab the URL names', async () => {
    renderPage(<CategoriesPage />, {
      selectedWeb: { slug: 'bristol', id: 3 },
      searchParams: { tab: 'tags' },
    })

    expect(
      await screen.findByRole('cell', { name: 'Volunteer-run' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tags' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })
})

describe('the categories an editor has set up', () => {
  it('are listed with how many listings use each one', async () => {
    renderCategoriesPage()

    expect(
      await screen.findByRole('cell', { name: 'Community' }),
    ).toBeInTheDocument()
    expect(rowFor('Community')).toHaveTextContent('2')
    expect(rowFor('Transport')).toHaveTextContent('0')
  })
})

describe('creating a category', () => {
  it('sends the new label, capitalised, for the web being edited', async () => {
    const created = recordRequests({ category: { id: 9 } })
    server.use(http.post('/api/categories', created.resolver))

    const { user } = renderCategoriesPage()

    await user.click(
      await screen.findByRole('button', { name: /new category/i }),
    )
    await user.type(
      await screen.findByLabelText('Category label'),
      'food growing',
    )
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(created.calls).toHaveLength(1))
    expect(created.calls[0].body).toMatchObject({
      label: 'Food growing',
      webId: 3,
    })
  })

  it('closes the dialog once the category is on its way', async () => {
    server.use(http.post('/api/categories', () => HttpResponse.json({})))
    const { user } = renderCategoriesPage()

    await user.click(
      await screen.findByRole('button', { name: /new category/i }),
    )
    await user.type(await screen.findByLabelText('Category label'), 'Food')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(screen.queryByLabelText('Category label')).toBeNull(),
    )
  })
})

describe('renaming a category', () => {
  it('arrives with the current label and sends the new one', async () => {
    const updated = recordRequests({ data: {} })
    server.use(http.patch('/api/categories/:id', updated.resolver))

    const { user } = renderCategoriesPage()

    await user.click(
      within(
        await screen.findByRole('row', { name: /^Transport\b/ }),
      ).getByRole('button', { name: 'Edit' }),
    )

    const label = await screen.findByLabelText('Category label')
    expect(label).toHaveValue('Transport')

    await user.clear(label)
    await user.type(label, 'Getting around')
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(updated.calls).toHaveLength(1))
    expect(updated.calls[0].url.pathname).toBe('/api/categories/2')
    expect(updated.calls[0].body).toMatchObject({ label: 'Getting around' })
  })
})

describe('deleting a category', () => {
  it('is allowed once nothing is using it', async () => {
    const deleted = recordRequests({ category: {} })
    server.use(http.delete('/api/categories/:id', deleted.resolver))

    const { user } = renderCategoriesPage()

    await user.click(
      within(
        await screen.findByRole('row', { name: /^Transport\b/ }),
      ).getByRole('button', { name: 'Edit' }),
    )
    await user.click(
      await screen.findByRole('button', { name: 'Remove category' }),
    )

    await waitFor(() => expect(deleted.calls).toHaveLength(1))
    expect(deleted.calls[0].url.pathname).toBe('/api/categories/2')
  })

  it('is refused while listings still belong to it', async () => {
    const { user } = renderCategoriesPage()

    await user.click(
      within(
        await screen.findByRole('row', { name: /^Community\b/ }),
      ).getByRole('button', { name: 'Edit' }),
    )

    expect(
      await screen.findByRole('button', { name: 'Remove category' }),
    ).toBeDisabled()
  })
})

describe('the tags an editor has set up', () => {
  it('are listed with how many listings carry each one', async () => {
    const { user } = renderCategoriesPage()

    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(user)

    expect(
      await screen.findByRole('cell', { name: 'Volunteer-run' }),
    ).toBeInTheDocument()
    expect(rowFor('Free')).toHaveTextContent('1')
  })
})

describe('when the tags cannot be loaded', () => {
  it('says so instead of breaking the page, and reports it', async () => {
    server.use(
      http.get(
        '/api/tags',
        () => new HttpResponse('Unable to fetch tags', { status: 500 }),
      ),
    )
    const { user } = renderCategoriesPage()

    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /couldn.t load your tags/i,
    )
    expect(vi.mocked(Sentry.captureException)).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          'Unable to fetch tags for bristol (500)',
        ),
      }),
    )
  })
})

describe('creating a tag', () => {
  it('sends the new label for the web being edited', async () => {
    const created = recordRequests({ data: { id: 9 } })
    server.use(http.post('/api/tags', created.resolver))

    const { user } = renderCategoriesPage()

    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(user)

    await user.click(await screen.findByRole('button', { name: /new tag/i }))
    await user.type(await screen.findByLabelText('Tag label'), 'Repair')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(created.calls).toHaveLength(1))
    expect(created.calls[0].body).toMatchObject({ label: 'Repair', webId: 3 })
  })

  it('will not create a tag with no label', async () => {
    const created = recordRequests({ data: {} })
    server.use(http.post('/api/tags', created.resolver))

    const { user } = renderCategoriesPage()

    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(user)
    await user.click(await screen.findByRole('button', { name: /new tag/i }))

    expect(await screen.findByRole('button', { name: 'Create' })).toBeDisabled()
    expect(created.calls).toHaveLength(0)
  })
})

describe('renaming a tag', () => {
  it('arrives with the current label and sends the new one', async () => {
    const updated = recordRequests({ tag: {} })
    server.use(http.patch('/api/tags/:id', updated.resolver))

    const { user } = renderCategoriesPage()

    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(user)

    await user.click(
      within(
        await screen.findByRole('row', { name: /^Volunteer-run\b/ }),
      ).getByRole('button', { name: 'Edit' }),
    )

    const label = await screen.findByLabelText('Tag label')
    expect(label).toHaveValue('Volunteer-run')

    await user.clear(label)
    await user.type(label, 'Run by volunteers')
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(updated.calls).toHaveLength(1))
    expect(updated.calls[0].url.pathname).toBe('/api/tags/5')
    expect(updated.calls[0].body).toMatchObject({ label: 'Run by volunteers' })
  })
})

describe('deleting a tag', () => {
  it('is allowed once nothing is using it', async () => {
    const deleted = recordRequests({ tag: {} })
    server.use(http.delete('/api/tags/:id', deleted.resolver))

    const { user } = renderCategoriesPage()

    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(user)

    await user.click(
      within(
        await screen.findByRole('row', { name: /^Volunteer-run\b/ }),
      ).getByRole('button', { name: 'Edit' }),
    )
    await user.click(await screen.findByRole('button', { name: 'Remove tag' }))

    await waitFor(() => expect(deleted.calls).toHaveLength(1))
    expect(deleted.calls[0].url.pathname).toBe('/api/tags/5')
  })

  it('is refused while listings still carry it', async () => {
    const { user } = renderCategoriesPage()

    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(user)

    await user.click(
      within(await screen.findByRole('row', { name: /^Free\b/ })).getByRole(
        'button',
        { name: 'Edit' },
      ),
    )

    expect(
      await screen.findByRole('button', { name: 'Remove tag' }),
    ).toBeDisabled()
  })
})

describe('giving a tag an icon', () => {
  it('sends the Green Map icon the editor picked, and credits Green Map', async () => {
    const created = recordRequests({ data: { id: 9 } })
    server.use(http.post('/api/tags', created.resolver))

    const { user } = renderCategoriesPage()

    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(user)
    await user.click(await screen.findByRole('button', { name: /new tag/i }))
    await user.type(await screen.findByLabelText('Tag label'), 'Food aid')

    await user.click(screen.getByRole('button', { name: 'Select an icon...' }))
    await user.click(await screen.findByRole('tab', { name: 'Green Map' }))
    expect(
      screen.getByRole('link', { name: 'Green Map System' }),
    ).toHaveAttribute('href', 'https://greenmap.org')
    await user.type(screen.getByRole('searchbox'), 'food bank')
    await user.click(screen.getByRole('button', { name: 'Food Bank' }))
    await user.click(screen.getByRole('button', { name: 'Use this icon' }))

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(created.calls).toHaveLength(1))
    expect(created.calls[0].body).toMatchObject({
      label: 'Food aid',
      icon: 'gm:food-bank',
    })
  })

  it('sends no icon when the editor leaves it unset', async () => {
    const created = recordRequests({ data: { id: 9 } })
    server.use(http.post('/api/tags', created.resolver))

    const { user } = renderCategoriesPage()

    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(user)
    await user.click(await screen.findByRole('button', { name: /new tag/i }))
    await user.type(await screen.findByLabelText('Tag label'), 'Repair')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(created.calls).toHaveLength(1))
    expect(created.calls[0].body).toMatchObject({ icon: null })
  })

  it("can take a tag's icon away again", async () => {
    const updated = recordRequests({ tag: {} })
    server.use(http.patch('/api/tags/:id', updated.resolver))

    const { user } = renderCategoriesPage()

    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(user)
    await user.click(
      within(await screen.findByRole('row', { name: /^Free\b/ })).getByRole(
        'button',
        { name: 'Edit' },
      ),
    )

    await user.click(
      await screen.findByRole('button', { name: 'Change icon (Food Bank)' }),
    )
    await user.click(await screen.findByRole('button', { name: 'Remove icon' }))
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(updated.calls).toHaveLength(1))
    expect(updated.calls[0].body).toMatchObject({ label: 'Free', icon: null })
  })
})

describe('finding the right icon', () => {
  const openGreenMapIcons = async () => {
    const { user } = renderCategoriesPage()
    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(user)
    await user.click(await screen.findByRole('button', { name: /new tag/i }))
    await user.click(
      await screen.findByRole('button', { name: 'Select an icon...' }),
    )
    await user.click(await screen.findByRole('tab', { name: 'Green Map' }))
    return user
  }

  it('searches what an icon means, not just its name', async () => {
    const user = await openGreenMapIcons()

    await user.type(screen.getByRole('searchbox'), 'hunger')

    expect(
      screen.getByRole('button', { name: 'Food Bank' }),
    ).toBeInTheDocument()
  })

  it('explains an icon before the editor commits to it', async () => {
    const user = await openGreenMapIcons()

    await user.type(screen.getByRole('searchbox'), 'food bank')
    await user.click(screen.getByRole('button', { name: 'Food Bank' }))

    const dialog = screen.getByRole('dialog', { name: 'Select an icon' })
    expect(dialog).toHaveTextContent(/hunger is reduced/)
    expect(screen.getByRole('button', { name: 'Use this icon' })).toBeEnabled()
  })
})

describe('previewing an icon', () => {
  it("shows the tag's chip as visitors will see it", async () => {
    const { user } = renderCategoriesPage()

    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(user)
    await user.click(await screen.findByRole('button', { name: /new tag/i }))
    await user.type(await screen.findByLabelText('Tag label'), 'Food aid')
    await user.click(screen.getByRole('button', { name: 'Select an icon...' }))
    await user.click(await screen.findByRole('tab', { name: 'Green Map' }))
    await user.type(screen.getByRole('searchbox'), 'food bank')
    await user.click(screen.getByRole('button', { name: 'Food Bank' }))

    const picker = screen.getByRole('dialog', { name: 'Select an icon' })
    const chip = within(picker).getByText('Food aid')
    expect(chip.querySelector('image')).toHaveAttribute(
      'href',
      '/icons/green-map/food-bank.svg',
    )
    expect(chip).not.toHaveTextContent('#')
  })
})

describe('picking a Font Awesome icon', () => {
  it('takes one click, with no explanation needed', async () => {
    const created = recordRequests({ data: { id: 9 } })
    server.use(http.post('/api/tags', created.resolver))

    const { user } = renderCategoriesPage()

    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(user)
    await user.click(await screen.findByRole('button', { name: /new tag/i }))
    await user.type(await screen.findByLabelText('Tag label'), 'Gardening')
    await user.click(screen.getByRole('button', { name: 'Select an icon...' }))

    expect(screen.queryByText(/see what it means/)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Use this icon' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Seedling' }))
    expect(screen.queryByRole('dialog', { name: 'Select an icon' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Create' }))
    await waitFor(() => expect(created.calls).toHaveLength(1))
    expect(created.calls[0].body).toMatchObject({ icon: 'Seedling' })
  })
})

describe("a category's icon", () => {
  it("is chosen from icons shown in the category's colour", async () => {
    const { user } = renderCategoriesPage()

    await user.click(
      within(
        await screen.findByRole('row', { name: /^Community\b/ }),
      ).getByRole('button', { name: 'Edit' }),
    )
    await user.click(
      await screen.findByRole('button', { name: 'Select an icon...' }),
    )
    await user.click(await screen.findByRole('tab', { name: 'Green Map' }))

    const glyph = screen
      .getByRole('button', { name: 'Food Bank' })
      .querySelector('svg')
    expect(glyph).toHaveStyle({ color: '#b0e3c1' })
    expect(glyph.querySelector('rect')).toHaveAttribute('fill', 'currentColor')
  })
})

describe('shared tags', () => {
  const openTags = async () => {
    const rendered = renderCategoriesPage()
    await screen.findByRole('cell', { name: 'Community' })
    await openTagsTab(rendered.user)
    await screen.findByRole('cell', { name: 'Volunteer-run' })
    return rendered
  }

  it('are listed, marked as shared, only when the web uses them', async () => {
    await openTags()

    expect(rowFor('Food Bank')).toHaveTextContent('Shared')
    expect(rowFor('Food Bank')).toHaveTextContent('2')
    expect(rowFor('Volunteer-run')).not.toHaveTextContent('Shared')
    expect(screen.queryByRole('row', { name: /^Cycling\b/ })).toBeNull()
  })

  it('cannot be edited, only taken off every listing in this web', async () => {
    const removed = recordRequests({ data: {} })
    server.use(http.delete('/api/tags/:id/listings', removed.resolver))
    const { user } = await openTags()

    const row = rowFor('Food Bank')
    expect(within(row).getByRole('button', { name: 'Edit' })).toBeDisabled()

    await user.click(
      within(row).getByRole('button', {
        name: 'Remove from all listings in this web',
      }),
    )
    await user.click(
      await screen.findByRole('button', { name: 'Remove from all listings' }),
    )

    await waitFor(() => expect(removed.calls).toHaveLength(1))
    expect(removed.calls[0].url.pathname).toBe('/api/tags/7/listings')
    expect(removed.calls[0].body).toEqual({ webId: 3 })
  })

  it("can be added to more of the web's listings", async () => {
    const changed = recordRequests({ data: {} })
    server.use(http.put('/api/tags/:id/listings', changed.resolver))
    const { user } = await openTags()

    await user.click(
      within(rowFor('Food Bank')).getByRole('button', {
        name: 'Add tag to listings',
      }),
    )
    expect(
      await screen.findByRole('checkbox', { name: 'Bike Kitchen' }),
    ).toBeChecked()
    await user.click(screen.getByRole('checkbox', { name: 'Seed Library' }))
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(changed.calls).toHaveLength(1))
    expect(changed.calls[0].url.pathname).toBe('/api/tags/7/listings')
    expect(changed.calls[0].body).toEqual({
      webId: 3,
      addedListingIds: [101, 102],
      removedListingIds: [],
    })
  })

  it("can't be copied as a web tag of the same name", async () => {
    const created = recordRequests({ data: { id: 9 } })
    server.use(http.post('/api/tags', created.resolver))
    const { user } = await openTags()

    await user.click(screen.getByRole('button', { name: /new tag/i }))
    await user.type(await screen.findByLabelText('Tag label'), 'cycling ')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(
      await screen.findByText(/"Cycling" is already a shared tag/),
    ).toBeInTheDocument()
    expect(created.calls).toHaveLength(0)
  })
})
