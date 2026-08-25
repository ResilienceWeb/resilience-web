import {
  recordRequests,
  stubCategories,
  stubListings,
  stubTags,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderPage } from '@/test/render'
import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
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
  { id: 5, label: 'Volunteer-run', listings: [], _count: { listings: 0 } },
  {
    id: 6,
    label: 'Free',
    listings: [{ id: 1 }],
    _count: { listings: 1 },
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
    stubListings([{ id: 1, title: 'Bike Kitchen', tags: [] }]),
  )
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
    await user.click(await screen.findByRole('button', { name: 'Remove' }))

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

    expect(await screen.findByRole('button', { name: 'Remove' })).toBeDisabled()
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
    await user.click(await screen.findByRole('button', { name: 'Remove' }))

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

    expect(await screen.findByRole('button', { name: 'Remove' })).toBeDisabled()
  })
})
