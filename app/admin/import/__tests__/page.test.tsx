import { recordRequests, stubCanEditWeb } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { router } from '@/test/next-navigation'
import { renderPage } from '@/test/render'
import { signInAs } from '@/test/session'
import { act, screen, waitFor } from '@testing-library/react'
import { http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import ImportPage from '../page.tsx'

beforeEach(() => {
  signInAs({ id: 'editor-1', email: 'editor@example.com' })
})

describe('the import page', () => {
  it('shows the import to someone who may edit this web', async () => {
    server.use(stubCanEditWeb(true))
    renderPage(<ImportPage />, { selectedWeb: { slug: 'bristol', id: 3 } })

    expect(
      await screen.findByRole('heading', { name: 'Import Listings' }),
    ).toBeInTheDocument()
  })

  // Opening /admin/import from a link or a refresh: the web's slug is known
  // straight away, but its id waits on the list of webs the user can manage.
  it("waits for the web to load rather than leaving when it's opened directly", async () => {
    const accessCheck = recordRequests({ canEdit: true })
    server.use(http.get('/api/web-access/check', accessCheck.resolver))
    renderPage(<ImportPage />, { selectedWeb: { slug: 'bristol' } })

    await waitFor(() => expect(accessCheck.calls).toHaveLength(1))
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))

    expect(router.push).not.toHaveBeenCalled()
  })

  it('sends someone who may not edit this web back to the dashboard', async () => {
    server.use(stubCanEditWeb(false))
    renderPage(<ImportPage />, { selectedWeb: { slug: 'bristol', id: 3 } })

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/admin'))
    expect(
      screen.queryByRole('heading', { name: 'Import Listings' }),
    ).toBeNull()
  })
})
