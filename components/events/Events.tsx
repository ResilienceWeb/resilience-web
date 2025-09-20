'use client'

import { useMemo, memo } from 'react'
import Link from 'next/link'
import { Clock, MapPin, Timer, Globe } from 'lucide-react'
import Footer from '@components/footer'
import useSelectedWebSlug from '@hooks/application/useSelectedWebSlug'

type EventAddress = {
  streetAddress?: string
  postalCode?: string
  geo?: {
    latitude: number
    longitude: number
  }
}

type EventOrganizer = {
  id: string
  name: string
}

type EventItem = {
  id: string
  name: string
  summary?: string
  description?: string
  startDate: string
  endDate: string
  publisherUrl?: string
  address?: EventAddress
  organizer?: EventOrganizer
}

type Props = {
  items: EventItem[]
}

function formatDateHeading(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    timeStyle: 'short',
  })
}

function formatTimeRange(start: Date, end: Date) {
  const startStr = formatTime(start)
  const endStr = formatTime(end)
  return `${startStr} – ${endStr}`
}

function formatDuration(start: Date, end: Date) {
  const ms = Math.max(0, end.getTime() - start.getTime())
  const mins = Math.round(ms / 60000)

  if (mins >= 60 * 24) {
    const days = Math.floor(mins / (60 * 24))
    const remMins = mins % (60 * 24)
    const remHours = Math.floor(remMins / 60)
    if (remHours > 0) {
      return `${days} day${days === 1 ? '' : 's'} ${remHours}h`
    }
    return `${days} day${days === 1 ? '' : 's'}`
  }
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'}`
  const hours = Math.floor(mins / 60)
  const rem = mins % 60
  return rem ? `${hours}h ${rem}m` : `${hours} hour${hours === 1 ? '' : 's'}`
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function getLocationLabel(address?: EventAddress) {
  const text = address?.streetAddress?.trim()
  if (!text) {
    return 'Online'
  }

  const lower = text.toLowerCase()
  if (
    lower.includes('online') ||
    lower.includes('zoom') ||
    lower.includes('teams')
  ) {
    return 'Online'
  }
  return text
}

const Events = ({ items }: Props) => {
  const selectedWebSlug = useSelectedWebSlug()

  const groups = useMemo(() => {
    if (!items || items.length === 0)
      return [] as { key: string; date: Date; events: EventItem[] }[]

    const sorted = [...items].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )

    const map = new Map<string, { date: Date; events: EventItem[] }>()
    for (const ev of sorted) {
      const start = new Date(ev.startDate)
      const key = dayKey(start)
      if (!map.has(key)) map.set(key, { date: start, events: [] })
      const entry = map.get(key)
      if (entry) entry.events.push(ev)
    }

    return Array.from(map.entries())
      .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
      .map(([key, value]) => ({ key, date: value.date, events: value.events }))
  }, [items])

  return (
    <>
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-gray-600 mt-1">
          These events are provided by our friends at{' '}
          <a
            href={`https://${selectedWebSlug}.placecal.org`}
            target="_blank"
            rel="noreferrer"
          >
            PlaceCal Norwich
          </a>
        </p>

        {groups.length === 0 && (
          <div className="text-center text-neutral-500">No upcoming events</div>
        )}

        {groups.map(({ key, date, events }) => (
          <div key={key} className="my-6">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl md:text-3xl font-semibold text-neutral-800">
                {formatDateHeading(date)}
              </h2>
            </div>

            <ul className="mt-4 flex flex-col gap-4">
              {events.map((ev) => {
                const start = new Date(ev.startDate)
                const end = new Date(ev.endDate)
                const onlineOrAddress = getLocationLabel(ev.address)
                const isOnline = onlineOrAddress === 'Online'
                return (
                  <Link
                    href={`https://${selectedWebSlug}.placecal.org/events/${ev.id}`}
                    key={ev.id}
                    target="_blank"
                    passHref
                  >
                    <li className="rounded-xl border border-neutral-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-lg md:text-xl font-semibold text-neutral-800">
                            {ev.name}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-700">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-emerald-600" />
                              <span>{formatTimeRange(start, end)}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Timer className="h-4 w-4 text-emerald-600" />
                              <span>{formatDuration(start, end)}</span>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-700">
                            <div className="flex items-center gap-2">
                              {isOnline ? (
                                <Globe className="h-4 w-4 shrink-0 text-emerald-600" />
                              ) : (
                                <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
                              )}
                              <span className="max-w-[28rem]">
                                {onlineOrAddress}
                              </span>
                            </div>

                            {ev.organizer?.name && (
                              <div className="flex items-center gap-2">
                                <span className="inline-block rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold px-3 py-1">
                                  {ev.organizer.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  </Link>
                )
              })}
            </ul>
          </div>
        ))}

        <p className="text-gray-600 mt-1">
          These events are provided by our friends at{' '}
          <a
            href={`https://${selectedWebSlug}.placecal.org`}
            target="_blank"
            rel="noreferrer"
          >
            PlaceCal Norwich
          </a>
        </p>
      </div>
      <Footer hideBorder />
    </>
  )
}

export default memo(Events)
