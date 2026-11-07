import type { PlaceCalEvent } from '@/lib/placecal'
import { webData } from '@/test/fixtures/web'
import { renderPage } from '@/test/render'
import { act, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Web from '../Web.tsx'

vi.mock('@helpers/analytics', () => ({ trackWebEvent: vi.fn() }))

const NEXT_WEEK = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

const REPAIR_CAFE: PlaceCalEvent = {
  id: '1',
  name: 'Repair Cafe',
  startDate: NEXT_WEEK.toISOString(),
  endDate: new Date(NEXT_WEEK.getTime() + 2 * 60 * 60 * 1000).toISOString(),
}

function renderWeb(events: Promise<PlaceCalEvent[]> | undefined, view: string) {
  return renderPage(
    <Web
      data={webData([{ title: 'Community Kitchen', category: 'Community' }])}
      categories={[{ label: 'Community', color: 'b0e3c1', icon: 'default' }]}
      events={events}
      features={[]}
      webId={1}
      webName="Norwich"
      webIsPublished
      webSlug="norwich"
    />,
    { searchParams: { view } },
  )
}

describe('the web page events tab', () => {
  it('shows the listings while PlaceCal has yet to answer', async () => {
    renderWeb(new Promise(() => {}), 'list')

    expect(
      await screen.findByRole('link', { name: /Community Kitchen/i }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('tab', { name: /events/i })[0]).toBeVisible()
  })

  it('fills in the events once PlaceCal answers', async () => {
    let answer: (events: PlaceCalEvent[]) => void
    renderWeb(
      new Promise((resolve) => {
        answer = resolve
      }),
      'events',
    )
    expect(screen.queryByRole('link', { name: /Repair Cafe/i })).toBeNull()

    act(() => answer([REPAIR_CAFE]))

    expect(
      await screen.findByRole('link', { name: /Repair Cafe/i }),
    ).toBeInTheDocument()
  })

  it('has no events tab for a web without a PlaceCal neighbourhood', async () => {
    renderWeb(undefined, 'list')

    await screen.findByRole('link', { name: /Community Kitchen/i })
    expect(screen.queryByRole('tab', { name: /events/i })).toBeNull()
  })
})
