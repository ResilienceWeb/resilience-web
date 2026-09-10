import { listing } from '@/test/fixtures/listing'
import {
  stubCanEditWeb,
  stubCategories,
  stubListings,
  stubMyWebAccess,
  stubWebs,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderPage, type SelectedWeb } from '@/test/render'
import { signInAs } from '@/test/session'
import { screen, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import AdminPage from '../page.tsx'

/**
 * The admin dashboard: the listings of the web you are working on.
 *
 * It cannot draw that list until four separate answers have come back — which
 * webs exist, which of them you are a team member of, whether you may edit the
 * one you are on, and its listings. Until they all have, it has to say it is
 * loading: "No listings yet" is a claim about the web, and it was being made
 * while the answers were still in flight.
 */

const BRISTOL = { id: 3, slug: 'bristol', title: 'Bristol' }

const LISTINGS = [
  listing({ id: 1, title: 'Bike Kitchen' }),
  listing({ id: 2, title: 'Tool Library' }),
]

const renderDashboard = ({
  selectedWeb = { slug: 'bristol', id: 3 },
}: { selectedWeb?: SelectedWeb } = {}) =>
  renderPage(<AdminPage />, { selectedWeb })

const spinner = () => screen.queryByRole('status', { name: 'Loading' })
const emptyState = () => screen.queryByText(/No listings yet/i)

/**
 * Fails if the empty state turns up at any point while the requests settle.
 * A plain assertion after render only sees the first frame, which is a spinner
 * either way — the flash came later, once some of the answers had arrived.
 */
const neverClaimsTheWebIsEmpty = async () => {
  await expect(
    waitFor(() => expect(emptyState()).toBeInTheDocument(), { timeout: 250 }),
  ).rejects.toThrow()
}

beforeEach(() => {
  signInAs({ id: 'u1', email: 'editor@example.com' })
  server.use(
    stubWebs([BRISTOL]),
    stubMyWebAccess([{ web: BRISTOL }]),
    stubCanEditWeb(true),
    stubListings(LISTINGS),
    stubCategories([]),
  )
})

describe('the dashboard while its data is still arriving', () => {
  it('keeps showing a spinner until the listings are there', async () => {
    server.use(
      http.get('/api/listings', async () => {
        await delay(50)
        return HttpResponse.json({ listings: LISTINGS })
      }),
    )

    renderDashboard()

    expect(spinner()).toBeInTheDocument()
    await neverClaimsTheWebIsEmpty()

    expect(await screen.findByText('Bike Kitchen')).toBeInTheDocument()
  })

  it('waits for the answer on whether you may edit this web', async () => {
    server.use(
      http.get('/api/web-access/check', async () => {
        await delay(80)
        return HttpResponse.json({ canEdit: true })
      }),
    )

    renderDashboard()

    await neverClaimsTheWebIsEmpty()
    expect(await screen.findByText('Bike Kitchen')).toBeInTheDocument()
  })

  it('waits for a web to be selected before saying anything about it', async () => {
    // The web selector defaults the selection in an effect once the web list
    // arrives, so for a moment the dashboard knows the user has a web but not
    // which one.
    renderDashboard({ selectedWeb: {} })

    await neverClaimsTheWebIsEmpty()
    expect(spinner()).toBeInTheDocument()
  })
})

describe('the dashboard once its data is there', () => {
  it('lists the listings of the web being edited', async () => {
    renderDashboard()

    expect(await screen.findByText('Bike Kitchen')).toBeInTheDocument()
    expect(screen.getByText('Tool Library')).toBeInTheDocument()
    expect(spinner()).not.toBeInTheDocument()
  })

  it('says a web with no listings is empty rather than spinning forever', async () => {
    server.use(stubListings([]))

    renderDashboard()

    expect(await screen.findByText(/No listings yet/i)).toBeInTheDocument()
    expect(spinner()).not.toBeInTheDocument()
  })

  it('shows no listings to someone who may not edit the web', async () => {
    server.use(stubCanEditWeb(false))

    renderDashboard()

    await waitFor(() => expect(spinner()).not.toBeInTheDocument())
    expect(screen.queryByText('Bike Kitchen')).not.toBeInTheDocument()
  })
})
