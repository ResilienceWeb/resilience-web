'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Spinner } from '@components/ui/spinner'
import {
  type HomepageWeb,
  hasMapLocation,
  isNewWeb,
  isWebDisplayedOnHomepage,
} from '../webs'
import WebsList from './WebsList'

const WebsMap = dynamic(() => import('./WebsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-50">
      <Spinner />
    </div>
  ),
})

const matches = (web: HomepageWeb, query: string) =>
  [web.title, web.location?.description]
    .filter(Boolean)
    .some((text) => text.toLowerCase().includes(query))

export default function WebsExplorer({ webs }: { webs: HomepageWeb[] }) {
  const [query, setQuery] = useState('')
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  const displayedWebs = useMemo(
    () =>
      webs
        .filter(isWebDisplayedOnHomepage)
        .sort(
          (a, b) =>
            Number(isNewWeb(b.publishedAt)) - Number(isNewWeb(a.publishedAt)) ||
            a.title.localeCompare(b.title),
        ),
    [webs],
  )
  const mappedWebs = useMemo(
    () => displayedWebs.filter(hasMapLocation),
    [displayedWebs],
  )

  const trimmedQuery = query.trim().toLowerCase()
  const listedWebs = trimmedQuery
    ? displayedWebs.filter((web) => matches(web, trimmedQuery))
    : displayedWebs

  const showOnMap = useCallback((slug: string) => {
    setSelectedSlug(slug)

    // On small screens the list sits below the map
    const map = mapRef.current?.getBoundingClientRect()
    if (map && (map.top < 0 || map.bottom > window.innerHeight)) {
      mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const deselect = useCallback((slug: string) => {
    setSelectedSlug((current) => (current === slug ? null : current))
  }, [])

  return (
    <section id="webs" className="w-full scroll-mt-4 py-8">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Find a Resilience Web near you
        </h2>
        <p className="mt-2 text-gray-600">
          Explore the community webs growing across the UK, or start one for
          your area.
        </p>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid lg:h-[640px] lg:grid-cols-[360px_minmax(0,1fr)]">
        <div
          ref={mapRef}
          className="relative h-[420px] border-b border-gray-200 sm:h-[480px] lg:order-2 lg:h-full lg:border-b-0"
        >
          <WebsMap
            webs={mappedWebs}
            activeSlug={activeSlug}
            selectedSlug={selectedSlug}
            onSelect={setSelectedSlug}
            onDeselect={deselect}
          />
        </div>
        <WebsList
          webs={listedWebs}
          query={query}
          onQueryChange={setQuery}
          activeSlug={activeSlug}
          selectedSlug={selectedSlug}
          onHover={setActiveSlug}
          onShowOnMap={showOnMap}
          className="lg:order-1 lg:border-r lg:border-gray-200"
        />
      </div>
    </section>
  )
}
