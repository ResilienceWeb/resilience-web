import { server } from '@/test/msw/server'
import { renderPage } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import WebSettingsPage from '../page.tsx'

/**
 * Web settings, the owner-only screen. What is covered here is the
 * related/neighbouring webs picker: the webs already linked have to show up as
 * selected, both when the page loads and after the owner changes them.
 */

const RELATED = { id: 7, title: 'Durham', slug: 'durham' }

const ALL_WEBS = [
  { id: 1, title: 'Bristol', slug: 'bristol' },
  RELATED,
  { id: 9, title: 'Leeds', slug: 'leeds' },
]

const stubWebs = (webs: unknown[]) =>
  http.get('/api/webs', () => HttpResponse.json({ data: webs }))

const stubWebWithRelations = (relations: unknown[]) =>
  http.get('/api/webs/:slug', ({ params }) =>
    HttpResponse.json({
      web: {
        id: 1,
        title: 'Bristol',
        slug: params.slug,
        published: true,
        description: '',
        contactEmail: '',
        relations,
      },
    }),
  )

const renderWebSettings = () =>
  renderPage(<WebSettingsPage />, { selectedWeb: { slug: 'bristol', id: 1 } })

beforeEach(() => {
  server.use(stubWebs(ALL_WEBS))
})

describe('the related webs picker', () => {
  it('shows the webs this one is already linked to', async () => {
    server.use(stubWebWithRelations([RELATED]))

    renderWebSettings()

    expect(
      await screen.findByRole('button', { name: `Remove ${RELATED.title}` }),
    ).toBeInTheDocument()
  })

  it('shows a web as selected once the owner picks it', async () => {
    server.use(stubWebWithRelations([]))

    const { user } = renderWebSettings()

    await user.click(await screen.findByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Leeds' }))

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Remove Leeds' }),
      ).toBeInTheDocument(),
    )
  })

  it('lets the owner unlink a web that is already selected', async () => {
    server.use(stubWebWithRelations([RELATED]))

    const { user } = renderWebSettings()

    await user.click(
      await screen.findByRole('button', { name: `Remove ${RELATED.title}` }),
    )

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: `Remove ${RELATED.title}` }),
      ).not.toBeInTheDocument(),
    )
  })
})
