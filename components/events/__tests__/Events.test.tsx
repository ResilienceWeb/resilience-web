import { renderPage } from '@/test/render'
import { screen } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import Events from '../Events'

// The page these events come from is regenerated once a day, so the component
// is always rendering data that may be hours old. Fixing "now" is what lets a
// test say which of that data a visitor should still be seeing.
const NOW = new Date('2026-09-18T14:00:00Z')

function event(name: string, startDate: string, endDate: string) {
  return { id: name, name, startDate, endDate }
}

beforeAll(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(NOW)
})
afterAll(() => vi.useRealTimers())

describe('Events', () => {
  it('shows events that are still to come', () => {
    renderPage(
      <Events
        items={[
          event('Repair Cafe', '2026-09-19T10:00:00Z', '2026-09-19T12:00:00Z'),
        ]}
        webSlug="norwich"
      />,
    )

    expect(
      screen.getByRole('link', { name: /Repair Cafe/i }),
    ).toBeInTheDocument()
  })

  it('hides an event that finished earlier today', () => {
    renderPage(
      <Events
        items={[
          event(
            'Art For Wellbeing',
            '2026-09-18T09:00:00Z',
            '2026-09-18T11:00:00Z',
          ),
          event('Raggy Dolls', '2026-09-18T16:00:00Z', '2026-09-18T17:30:00Z'),
        ]}
        webSlug="norwich"
      />,
    )

    expect(
      screen.getByRole('link', { name: /Raggy Dolls/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /Art For Wellbeing/i }),
    ).not.toBeInTheDocument()
  })

  it('hides an event from a day the page was built before', () => {
    renderPage(
      <Events
        items={[
          event(
            'Yesterday Social',
            '2026-09-17T10:00:00Z',
            '2026-09-17T12:00:00Z',
          ),
        ]}
        webSlug="norwich"
      />,
    )

    expect(
      screen.queryByRole('link', { name: /Yesterday Social/i }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('No upcoming events')).toBeInTheDocument()
  })

  it('keeps showing an event that is under way', () => {
    renderPage(
      <Events
        items={[
          event(
            'Community Lunch',
            '2026-09-18T13:00:00Z',
            '2026-09-18T15:00:00Z',
          ),
        ]}
        webSlug="norwich"
      />,
    )

    expect(
      screen.getByRole('link', { name: /Community Lunch/i }),
    ).toBeInTheDocument()
  })

  it('says so when there is nothing coming up', () => {
    renderPage(<Events items={[]} webSlug="norwich" />)

    expect(screen.getByText('No upcoming events')).toBeInTheDocument()
  })
})
