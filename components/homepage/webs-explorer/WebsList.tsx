'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Plus, Search } from 'lucide-react'
import { getWebUrl } from '@helpers/config'
import { captureEvent } from '@helpers/posthog'
import { cn } from '@components/lib/utils'
import { Badge } from '@components/ui/badge'
import { Input } from '@components/ui/input'
import {
  type HomepageWeb,
  hasMapLocation,
  isNewWeb,
  shortPlaceName,
} from '../webs'

interface WebsListProps {
  webs: HomepageWeb[]
  query: string
  onQueryChange: (query: string) => void
  activeSlug: string | null
  selectedSlug: string | null
  onHover: (slug: string | null) => void
  onShowOnMap: (slug: string) => void
  className?: string
}

export default function WebsList({
  webs,
  query,
  onQueryChange,
  activeSlug,
  selectedSlug,
  onHover,
  onShowOnMap,
  className,
}: WebsListProps) {
  const listRef = useRef<HTMLUListElement>(null)

  // When a web is picked on the map, bring it into view in the sidebar. Only
  // the list scrolls: on small screens it isn't a scroll container, and
  // moving the page would take the open popup out of sight.
  useEffect(() => {
    const list = listRef.current
    const item = list?.querySelector<HTMLElement>(
      `[data-slug="${selectedSlug}"]`,
    )
    if (!list || !item || list.scrollHeight <= list.clientHeight) return

    const top = item.offsetTop
    const bottom = top + item.offsetHeight
    if (top < list.scrollTop || bottom > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: top - 8, behavior: 'smooth' })
    }
  }, [selectedSlug])

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="border-b border-gray-200 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            aria-label="Search webs"
            placeholder="Search by place or name"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="h-10 pl-9"
          />
        </div>
      </div>

      {webs.length === 0 ? (
        <p className="flex-1 px-4 py-8 text-center text-sm text-gray-500">
          No webs match “{query}” yet. Could you start one?
        </p>
      ) : (
        <ul
          ref={listRef}
          aria-label="Resilience Webs"
          className="relative flex-1 space-y-1 overflow-y-auto p-2"
        >
          {webs.map((web) => (
            <WebItem
              key={web.id}
              web={web}
              highlighted={web.slug === activeSlug || web.slug === selectedSlug}
              onHover={onHover}
              onShowOnMap={onShowOnMap}
            />
          ))}
        </ul>
      )}

      <div className="border-t border-gray-200 p-3">
        <Link
          href="/auth/signup"
          onClick={() => captureEvent('create-new-web-click')}
          className="group flex items-center gap-3 rounded-xl border border-dashed border-gray-300 p-3 transition-colors hover:border-primary hover:bg-primary/5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus className="h-4 w-4" />
          </span>
          <span className="text-sm">
            <span className="block font-semibold text-gray-900">
              Start a web for your area
            </span>
            <span className="text-gray-500">
              Map the groups in your community
            </span>
          </span>
        </Link>
      </div>
    </div>
  )
}

function WebItem({
  web,
  highlighted,
  onHover,
  onShowOnMap,
}: {
  web: HomepageWeb
  highlighted: boolean
  onHover: (slug: string | null) => void
  onShowOnMap: (slug: string) => void
}) {
  const listingCount = web._count?.listings ?? 0

  return (
    <li
      data-slug={web.slug}
      onMouseEnter={() => onHover(web.slug)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        'relative flex items-center gap-3 rounded-xl p-2 transition-colors',
        highlighted ? 'bg-primary/10' : 'hover:bg-gray-50',
      )}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={web.image}
          alt=""
          fill
          // Web images are wide (around 2:1) and cropped square here, so the
          // file must be about twice the tile's width to fill its height
          sizes="112px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {/* Stretched over the row, so the whole row opens the web */}
          <Link
            href={getWebUrl(web.slug)}
            className="truncate font-semibold text-gray-900 after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
          >
            {web.title}
          </Link>
          {isNewWeb(web.publishedAt) && (
            <Badge variant="secondary" className="shrink-0">
              New
            </Badge>
          )}
        </div>
        {web.location?.description && (
          <p className="truncate text-sm text-gray-500">
            {shortPlaceName(web.location.description)}
          </p>
        )}
        <p className="text-xs text-gray-500">
          {listingCount.toLocaleString('en-GB')} listing
          {listingCount === 1 ? '' : 's'}
        </p>
      </div>

      {hasMapLocation(web) && (
        <button
          type="button"
          aria-label={`Show ${web.title} on the map`}
          title="Show on the map"
          onClick={() => onShowOnMap(web.slug)}
          className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white hover:text-primary hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          <MapPin className="h-4 w-4" />
        </button>
      )}
    </li>
  )
}
