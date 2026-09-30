import { stubCanEditWeb } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { router } from '@/test/next-navigation'
import { renderPage } from '@/test/render'
import { signInAs } from '@/test/session'
import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import ExportPage from '../page.tsx'

const renderExport = () =>
  renderPage(<ExportPage />, { selectedWeb: { slug: 'bristol', id: 3 } })

beforeEach(() => {
  signInAs({ id: 'editor-1', email: 'editor@example.com' })
})

describe('the export page', () => {
  it("downloads this web's listings as a spreadsheet", async () => {
    server.use(stubCanEditWeb(true))
    renderExport()

    const link = await screen.findByRole('link', { name: /Download CSV/ })

    expect(link).toHaveAttribute('href', '/api/listings/export?web=bristol')
    expect(link).toHaveAttribute('download')
  })

  it('sends someone who may not edit this web back to the dashboard', async () => {
    server.use(stubCanEditWeb(false))
    renderExport()

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/admin'))
    expect(screen.queryByRole('link', { name: /Download CSV/ })).toBeNull()
  })
})
