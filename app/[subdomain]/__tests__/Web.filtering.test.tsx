import { webData } from '@/test/fixtures/web'
import { renderPage } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Web from '../Web.tsx'

vi.mock('@helpers/analytics', () => ({ trackWebEvent: vi.fn() }))

/** The server has these when it renders, so the filters never fetch them. */
const CATEGORIES = [
  { label: 'Community', color: 'b0e3c1', icon: 'default' },
  { label: 'Environment', color: 'b0e3c1', icon: 'default' },
  { label: 'Transportation', color: 'b0e3c1', icon: 'default' },
]

const TAGS = [{ id: 1, label: 'Volunteer-run' }]

const LISTINGS = [
  { title: 'Community Kitchen', category: 'Community' },
  { title: 'Carbon Footprint', category: 'Environment' },
  { title: 'Sustainable Food', category: 'Environment' },
  { title: 'Cycling Campaign', category: 'Transportation' },
]

/** Renders the web page already on the list tab, which is what these tests drive. */
function renderWeb() {
  return renderPage(
    <Web
      data={webData(LISTINGS)}
      categories={CATEGORIES}
      tags={TAGS}
      features={[]}
      webId={1}
      webName="Bristol"
      webIsPublished
      webSlug="bristol"
    />,
    { searchParams: { view: 'list' } },
  )
}

/**
 * A listing is rendered as a link whose accessible name contains its title,
 * which is how a visitor picks one out of the grid.
 */
const listing = (title: string) =>
  screen.queryByRole('link', { name: new RegExp(title, 'i') })

/** The search box is debounced by 500ms, so every assertion has to settle. */
const SETTLE = { timeout: 3000 }

const expectVisible = (titles: string[]) =>
  waitFor(
    () => titles.forEach((title) => expect(listing(title)).toBeInTheDocument()),
    SETTLE,
  )

const expectHidden = (titles: string[]) =>
  waitFor(
    () => titles.forEach((title) => expect(listing(title)).toBeNull()),
    SETTLE,
  )

const ALL_TITLES = LISTINGS.map((l) => l.title)

describe('the web page listing filters', () => {
  it('shows every listing before anything is filtered', async () => {
    renderWeb()

    await expectVisible(ALL_TITLES)
  })

  it('narrows the list as the visitor types, and restores it when cleared', async () => {
    const { user } = renderWeb()
    await expectVisible(ALL_TITLES)

    await user.type(await screen.findByPlaceholderText('Search'), 'food')

    await expectVisible(['Sustainable Food'])
    await expectHidden([
      'Community Kitchen',
      'Carbon Footprint',
      'Cycling Campaign',
    ])

    await user.click(screen.getByRole('button', { name: /clear search/i }))

    await expectVisible(ALL_TITLES)
  })

  it('matches on description as well as title', async () => {
    const { user } = renderPage(
      <Web
        data={webData([
          { title: 'Bike Kitchen', category: 'Transportation' },
          {
            title: 'Repair Cafe',
            category: 'Community',
            description: 'Volunteers fix bicycles every Sunday',
          },
        ])}
        categories={CATEGORIES}
        tags={TAGS}
        features={[]}
        webId={1}
        webName="Bristol"
        webIsPublished
        webSlug="bristol"
      />,
      { searchParams: { view: 'list' } },
    )

    await user.type(await screen.findByPlaceholderText('Search'), 'bicycles')

    await expectVisible(['Repair Cafe'])
    await expectHidden(['Bike Kitchen'])
  })

  it('offers to propose a listing when nothing matches', async () => {
    const { user } = renderWeb()
    await expectVisible(ALL_TITLES)

    await user.type(
      await screen.findByPlaceholderText('Search'),
      'nothing matches this',
    )

    expect(
      await screen.findByText(/No listings were found/i, {}, SETTLE),
    ).toBeInTheDocument()
    // The drawer offers the same call to action, so there is more than one.
    expect(
      screen.getAllByRole('link', { name: /propose new listing/i }).length,
    ).toBeGreaterThan(0)
    await expectHidden(ALL_TITLES)
  })
})

describe('the web page category filter', () => {
  /**
   * Opens the category combobox and ticks each label. The popover stays open
   * between selections, which is how multi-select behaves for a real visitor,
   * so they are all picked in one session and it is dismissed at the end.
   */
  async function chooseCategories(
    user: ReturnType<typeof renderPage>['user'],
    ...labels: string[]
  ) {
    const [trigger] = await screen.findAllByRole('combobox')
    await user.click(trigger)

    for (const label of labels) {
      await user.click(await screen.findByRole('option', { name: label }))
    }

    await user.keyboard('{Escape}')
  }

  it('shows only listings in the chosen category', async () => {
    const { user } = renderWeb()
    await expectVisible(ALL_TITLES)

    await chooseCategories(user, 'Environment')

    await expectVisible(['Carbon Footprint', 'Sustainable Food'])
    await expectHidden(['Community Kitchen', 'Cycling Campaign'])
  })

  it('adds a second category rather than replacing the first', async () => {
    const { user } = renderWeb()
    await expectVisible(ALL_TITLES)

    await chooseCategories(user, 'Environment', 'Transportation')

    await expectVisible([
      'Carbon Footprint',
      'Sustainable Food',
      'Cycling Campaign',
    ])
    await expectHidden(['Community Kitchen'])
  })

  it('restores the full list when a category is removed again', async () => {
    const { user } = renderWeb()
    await chooseCategories(user, 'Environment')
    await expectHidden(['Community Kitchen'])

    await user.click(
      await screen.findByRole('button', { name: 'Remove Environment' }),
    )

    await expectVisible(ALL_TITLES)
  })

  it('combines the category filter with the search box', async () => {
    const { user } = renderWeb()

    await chooseCategories(user, 'Environment')
    await expectVisible(['Carbon Footprint', 'Sustainable Food'])

    await user.type(await screen.findByPlaceholderText('Search'), 'carbon')

    await expectVisible(['Carbon Footprint'])
    await expectHidden(['Sustainable Food', 'Community Kitchen'])
  })

  it('starts filtered when the URL already names a category', async () => {
    renderPage(
      <Web
        data={webData(LISTINGS)}
        categories={CATEGORIES}
        tags={TAGS}
        features={[]}
        webId={1}
        webName="Bristol"
        webIsPublished
        webSlug="bristol"
      />,
      { searchParams: { view: 'list', categories: 'Transportation' } },
    )

    await expectVisible(['Cycling Campaign'])
    await expectHidden(['Community Kitchen', 'Carbon Footprint'])
  })
})

describe('the images in the list', () => {
  it('asks for the first screenful up front and leaves the rest until they are scrolled to', async () => {
    const withImages = Array.from({ length: 9 }, (_, i) => ({
      title: `Listing ${i}`,
      category: 'Community',
      image: `https://example.com/${i}.png`,
    }))

    renderPage(
      <Web
        data={webData(withImages)}
        categories={CATEGORIES}
        tags={TAGS}
        features={[]}
        webId={1}
        webName="Bristol"
        webIsPublished
        webSlug="bristol"
      />,
      { searchParams: { view: 'list' } },
    )

    const images = await screen.findAllByRole('img', { name: /cover image/i })
    const eager = images.filter((i) => i.getAttribute('loading') === 'eager')

    expect(images).toHaveLength(9)
    expect(eager).toHaveLength(6)
  })
})
