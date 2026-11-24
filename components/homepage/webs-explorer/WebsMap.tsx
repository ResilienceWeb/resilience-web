'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import { getImageProps } from 'next/image'
import L from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet/dist/leaflet.css'
import { Maximize } from 'lucide-react'
import { getWebUrl } from '@helpers/config'
import { escapeHtml } from '@helpers/map'
import { captureEvent } from '@helpers/posthog'
import { type HomepageWeb, isNewWeb, shortPlaceName } from '../webs'

const UK_CENTER: [number, number] = [54.5, -2.5]
const UK_ZOOM = 6
const FIT_PADDING: [number, number] = [48, 48]
const MARKER_IMAGE_WIDTH = 96

interface WebsMapProps {
  webs: HomepageWeb[]
  activeSlug: string | null
  selectedSlug: string | null
  onSelect: (slug: string) => void
  onDeselect: (slug: string) => void
}

type WebMarker = L.Marker & { web: HomepageWeb }

// Web images are wide (around 2:1), so a round marker cropped from one needs
// a file about twice the marker's width; `getImageProps` hands back the 2x
// candidate as `src`
function imageUrl(src: string, size: number) {
  return getImageProps({ src, alt: '', width: size, height: size, quality: 80 })
    .props.src
}

function listingCountLabel(web: HomepageWeb) {
  const count = web._count?.listings ?? 0
  return `${count.toLocaleString('en-GB')} listing${count === 1 ? '' : 's'}`
}

function webIcon(web: HomepageWeb, active: boolean) {
  return L.divIcon({
    html: `<div class="web-marker${active ? ' web-marker--active' : ''}"><img src="${escapeHtml(imageUrl(web.image, MARKER_IMAGE_WIDTH))}" alt="" /></div>`,
    className: 'web-marker-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
    tooltipAnchor: [0, -24],
  })
}

// A small fan of the clustered webs' photos with a count, so webs that sit
// close together (Cambridge has three) read as a group rather than one web
function clusterIcon(cluster: L.MarkerCluster) {
  const markers = cluster.getAllChildMarkers() as WebMarker[]
  const photos = markers
    .slice(0, 3)
    .map(
      (marker, index) =>
        `<img src="${escapeHtml(imageUrl(marker.web.image, MARKER_IMAGE_WIDTH))}" alt="" style="left: ${index * 16}px; z-index: ${3 - index}" />`,
    )
    .join('')
  const width = 44 + 16 * (Math.min(markers.length, 3) - 1)

  return L.divIcon({
    html: `<div class="web-cluster" style="width: ${width}px">${photos}<span>${markers.length}</span></div>`,
    className: 'web-marker-icon',
    iconSize: [width, 44],
    iconAnchor: [width / 2, 22],
  })
}

function popupContent(web: HomepageWeb) {
  const placeName = shortPlaceName(web.location?.description)
  const place = placeName
    ? `<p class="web-popup__place">${escapeHtml(placeName)}</p>`
    : ''
  const badge = isNewWeb(web.publishedAt)
    ? '<span class="web-popup__badge">New</span>'
    : ''

  return `
    <div class="web-popup__image">
      <img src="${escapeHtml(imageUrl(web.image, 320))}" alt="" />
      ${badge}
    </div>
    <div class="web-popup__body">
      <p class="web-popup__title">${escapeHtml(web.title)}</p>
      ${place}
      <p class="web-popup__count">${listingCountLabel(web)}</p>
      <a class="web-popup__link" href="${escapeHtml(getWebUrl(web.slug))}" data-slug="${escapeHtml(web.slug)}">Explore this web &rarr;</a>
    </div>
  `
}

function WebMarkers({
  webs,
  activeSlug,
  selectedSlug,
  onSelect,
  onDeselect,
}: WebsMapProps) {
  const map = useMap()
  const markersRef = useRef(new Map<string, WebMarker>())
  const groupRef = useRef<L.MarkerClusterGroup | null>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const [ready, setReady] = useState(false)

  // Markers are built once per set of webs, so the handlers read the latest
  // callbacks through a ref rather than rebuilding every marker on render
  const handlersRef = useRef({ onSelect, onDeselect })
  useEffect(() => {
    handlersRef.current = { onSelect, onDeselect }
  }, [onSelect, onDeselect])

  useEffect(() => {
    let group: L.MarkerClusterGroup | null = null
    let cancelled = false
    const markers = markersRef.current

    const setup = async () => {
      await import('leaflet.markercluster')
      if (cancelled) return

      group = L.markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        maxClusterRadius: 28,
        iconCreateFunction: clusterIcon,
      })

      webs.forEach((web) => {
        const marker = L.marker(
          [web.location.latitude, web.location.longitude],
          {
            icon: webIcon(web, false),
            title: web.title,
            alt: web.title,
            riseOnHover: true,
          },
        ) as WebMarker
        marker.web = web

        marker
          .bindTooltip(escapeHtml(web.title), {
            direction: 'top',
            className: 'web-marker-tooltip',
          })
          .bindPopup(popupContent(web), {
            className: 'web-popup',
            minWidth: 260,
            maxWidth: 260,
          })
          .on('popupopen', () => {
            marker.closeTooltip()
            handlersRef.current.onSelect(web.slug)
          })
          .on('popupclose', () => handlersRef.current.onDeselect(web.slug))

        markers.set(web.slug, marker)
        group.addLayer(marker)
      })

      map.addLayer(group)
      if (webs.length > 0) {
        map.fitBounds(group.getBounds(), { padding: FIT_PADDING, maxZoom: 9 })
      }
      groupRef.current = group
      setReady(true)
    }

    setup()

    return () => {
      cancelled = true
      markers.clear()
      groupRef.current = null
      if (group) map.removeLayer(group)
    }
  }, [map, webs])

  useEffect(() => {
    markersRef.current.forEach((marker, slug) => {
      const active = slug === activeSlug || slug === selectedSlug
      marker.setIcon(webIcon(marker.web, active))
      marker.setZIndexOffset(active ? 1000 : 0)
    })
  }, [activeSlug, selectedSlug, ready])

  useEffect(() => {
    const marker = selectedSlug && markersRef.current.get(selectedSlug)
    if (!ready || !marker || marker.isPopupOpen()) return

    groupRef.current?.zoomToShowLayer(marker, () => marker.openPopup())
  }, [selectedSlug, ready])

  useEffect(() => {
    if (resetRef.current) {
      L.DomEvent.disableClickPropagation(resetRef.current)
    }
  }, [])

  useEffect(() => {
    const container = map.getContainer()
    const trackExplore = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLElement>(
        '.web-popup__link',
      )
      if (link) {
        captureEvent('web-popup-explore-click', { slug: link.dataset.slug })
      }
    }
    container.addEventListener('click', trackExplore)
    return () => container.removeEventListener('click', trackExplore)
  }, [map])

  return (
    <button
      ref={resetRef}
      type="button"
      onClick={() => {
        map.closePopup()
        if (groupRef.current && webs.length > 0) {
          map.flyToBounds(groupRef.current.getBounds(), {
            padding: FIT_PADDING,
            maxZoom: 9,
          })
        }
      }}
      className="absolute top-3 right-3 z-1000 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
    >
      <Maximize className="h-3.5 w-3.5" />
      Show all webs
    </button>
  )
}

// Scrolling the page past the map shouldn't zoom it, so the wheel only
// zooms once someone has clicked into the map
function ScrollWheelZoomOnFocus() {
  const map = useMap()

  useEffect(() => {
    const enable = () => map.scrollWheelZoom.enable()
    const disable = () => map.scrollWheelZoom.disable()
    map.on('click focus', enable)
    map.on('blur mouseout', disable)
    return () => {
      map.off('click focus', enable)
      map.off('blur mouseout', disable)
    }
  }, [map])

  return null
}

export default function WebsMap(props: WebsMapProps) {
  return (
    <MapContainer
      center={UK_CENTER}
      zoom={UK_ZOOM}
      scrollWheelZoom={false}
      zoomControl={false}
      className="webs-map h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <ZoomControl position="bottomright" />
      <ScrollWheelZoomOnFocus />
      <WebMarkers {...props} />
    </MapContainer>
  )
}
