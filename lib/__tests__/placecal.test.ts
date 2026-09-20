import { describe, expect, it } from 'vitest'
import { filterUpcomingEvents, getPlaceCalNeighbourhoodId } from '../placecal'

const NOW = new Date('2026-09-18T14:00:00Z')

function event(endDate: string, id = endDate) {
  return { id, endDate }
}

describe('filterUpcomingEvents', () => {
  it('drops events that finished on an earlier day', () => {
    const events = [
      event('2026-09-17T12:00:00Z', 'yesterday'),
      event('2026-09-19T12:00:00Z', 'tomorrow'),
    ]

    expect(filterUpcomingEvents(events, NOW).map((e) => e.id)).toEqual([
      'tomorrow',
    ])
  })

  it('drops events that finished earlier today', () => {
    const events = [
      event('2026-09-18T12:00:00Z', 'this-morning'),
      event('2026-09-18T18:00:00Z', 'this-evening'),
    ]

    expect(filterUpcomingEvents(events, NOW).map((e) => e.id)).toEqual([
      'this-evening',
    ])
  })

  it('keeps an event that is running right now', () => {
    const events = [event('2026-09-18T15:00:00Z', 'in-progress')]

    expect(filterUpcomingEvents(events, NOW).map((e) => e.id)).toEqual([
      'in-progress',
    ])
  })

  it('keeps an event whose end date cannot be parsed', () => {
    const events = [event('not a date', 'unparseable')]

    expect(filterUpcomingEvents(events, NOW).map((e) => e.id)).toEqual([
      'unparseable',
    ])
  })
})

describe('getPlaceCalNeighbourhoodId', () => {
  it('resolves only webs with a configured neighbourhood', () => {
    expect(getPlaceCalNeighbourhoodId('norwich')).toBe(14629)
    expect(getPlaceCalNeighbourhoodId('bristol')).toBeUndefined()
  })
})
