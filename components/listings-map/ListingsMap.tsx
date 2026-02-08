'use client'

import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { BsArrowsFullscreen } from 'react-icons/bs'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet/dist/leaflet.css'
import { createCustomIcon } from '@helpers/map'
import Item from '@components/main-list/item'
import { Button } from '@components/ui/button'
import { Spinner } from '@components/ui/spinner'
import useCategoriesPublic from '@hooks/categories/useCategoriesPublic'

interface MapProps {
  items?: any[]
  webSlug: string
}

function MarkerClusterGroup({ items }: { items: any[] }) {
  const map = useMap()
  const clusterRef = useRef<any>(null)

  useEffect(() => {
    // eslint-disable-next-line promise/catch-or-return
    import('leaflet.markercluster').then(() => {
      const clusterGroup = new (L as any).MarkerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 20,
      })

      clusterRef.current = clusterGroup

      items.forEach((item) => {
        const markerIcon = item.category?.icon
          ? createCustomIcon(item.category.icon, item.category.color)
          : new L.Icon.Default()

        const marker = L.marker(
          [
            parseFloat(item.location.latitude),
            parseFloat(item.location.longitude),
          ],
          { icon: markerIcon },
        )

        const popupContent = `
          <div class="flex flex-col gap-2 p-2">
            <h3 class="text-lg font-bold">${item.label}</h3>
            ${
              item.description
                ? `<p class="m-0 text-sm text-gray-600">${
                    item.description.length > 100
                      ? item.description.substring(0, 100) + '...'
                      : item.description
                  }</p>`
                : ''
            }
            ${
              item.category
                ? `<div class="size-fit inline-flex items-center rounded-full px-2 py-1 text-xs font-medium" style="background-color: ${item.category.color}20; color: ${item.category.color}">
                ${item.category.label}
              </div>`
                : ''
            }
            <a href="/${item.slug}" class="text-sm text-blue-600 hover:underline">View details</a>
          </div>
        `

        marker.bindPopup(popupContent)
        clusterGroup.addLayer(marker)
      })

      map.addLayer(clusterGroup)

      return () => {
        if (clusterRef.current) {
          map.removeLayer(clusterRef.current)
        }
      }
    })
  }, [map, items])

  return null
}

function FitBoundsToMarkers({ markers }: { markers: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(
        markers.map((coords) => L.latLng(coords[0], coords[1])),
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, markers])

  return null
}

function ListingsMap({ items = [], webSlug }: MapProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isUnmappedPanelOpen, setIsUnmappedPanelOpen] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const { categories } = useCategoriesPublic({ webSlug })
  const categoriesIndexes = useMemo(() => {
    const obj: Record<string, number> = {}
    categories?.map((c, i) => (obj[c.label] = i))
    return obj
  }, [categories])

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      mapContainerRef.current
        ?.requestFullscreen()
        .then(() => setIsFullScreen(true))
        .catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
          )
        })
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullScreen(false))
        .catch((err) => {
          console.error(
            `Error attempting to exit full-screen mode: ${err.message} (${err.name})`,
          )
        })
    }
  }, [])

  useEffect(() => {
    import('./leaflet-icon-fix')

    // Load Font Awesome for icons (if using FontAwesome in custom markers)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
    document.head.appendChild(link)

    // Simulate loading time for map initialization
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => {
      clearTimeout(timer)
      document.head.removeChild(link)
    }
  }, [])

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullScreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
    }
  }, [])

  const defaultCenter = [52.401, 0.263]
  const defaultZoom = 14

  const listingsWithCoordinates = useMemo(
    () =>
      items.filter(
        (item) => item.location?.latitude && item.location?.longitude,
      ),
    [items],
  )

  const listingsWithoutCoordinates = useMemo(
    () =>
      items.filter(
        (item) => !item.location?.latitude || !item.location?.longitude,
      ),
    [items],
  )

  // Create array of marker positions for the FitBoundsToMarkers component
  const markerPositions = listingsWithCoordinates.map(
    (item) =>
      [
        parseFloat(item.location.latitude),
        parseFloat(item.location.longitude),
      ] as [number, number],
  )

  return (
    <div className="w-full">
      {listingsWithoutCoordinates.length > 0 && (
        <div className="border-b bg-gray-50">
          <button
            className="flex w-full items-center justify-between px-4 py-2.5 text-sm"
            onClick={() => setIsUnmappedPanelOpen((prev) => !prev)}
          >
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
                {listingsWithoutCoordinates.length}
              </span>
              listing
              {listingsWithoutCoordinates.length !== 1 ? 's' : ''} without a
              location
              {!isUnmappedPanelOpen && (
                <span className="text-xs">— click to show</span>
              )}
            </span>
            {isUnmappedPanelOpen ? (
              <HiChevronUp className="h-5 w-5" />
            ) : (
              <HiChevronDown className="h-5 w-5" />
            )}
          </button>
          {isUnmappedPanelOpen && (
            <div className="border-t px-4 pb-4">
              <div className="flex gap-4 overflow-x-auto py-3">
                {listingsWithoutCoordinates.map((item) => (
                  <div key={item.id} className="w-[220px] shrink-0">
                    <Item
                      categoriesIndexes={categoriesIndexes}
                      dataItem={item}
                      simplified
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {isLoading ? (
        <div className="flex h-[calc(100vh-150px)] w-full flex-col items-center justify-center bg-white">
          <Spinner />
        </div>
      ) : listingsWithCoordinates.length === 0 ? (
        <div className="flex h-[calc(100vh-150px)] w-full flex-col items-center justify-center bg-white">
          <div className="max-w-md text-center">
            <h3 className="mb-2 text-xl font-semibold">
              No locations to display
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or switching to the List view.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapContainerRef} className="relative">
            <Button
              variant="outline"
              onClick={toggleFullScreen}
              className="absolute top-3 right-3 z-1000 bg-white flex items-center gap-1 text-xs py-1 h-auto shadow-md"
            >
              <BsArrowsFullscreen className="h-3 w-3" />
              {isFullScreen ? 'Exit fullscreen' : 'Fullscreen'}
            </Button>
            <MapContainer
              center={defaultCenter as [number, number]}
              zoom={defaultZoom}
              scrollWheelZoom={true}
              style={{ height: 'calc(100vh - 135px)', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {markerPositions.length > 0 && (
                <FitBoundsToMarkers markers={markerPositions} />
              )}

              <MarkerClusterGroup items={listingsWithCoordinates} />
            </MapContainer>
          </div>
        </>
      )}
    </div>
  )
}

export default ListingsMap
