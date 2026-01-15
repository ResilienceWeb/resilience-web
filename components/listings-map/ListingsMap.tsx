'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { BsArrowsFullscreen } from 'react-icons/bs'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import dynamic from 'next/dynamic'
import L from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet/dist/leaflet.css'
import { createCustomIcon } from '@helpers/map'
import { Button } from '@components/ui/button'
import { Spinner } from '@components/ui/spinner'

interface MapProps {
  items?: any[]
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

function MapComponent({ items = [] }: MapProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)

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

  const listingsWithCoordinates = items.filter(
    (item) => item.location?.latitude && item.location?.longitude,
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
              None of the current listings have location data available. Try
              adjusting your filters or switching to the List view.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b bg-white p-2">
            <p className="text-sm text-gray-600">
              Displaying{' '}
              <span className="font-semibold">
                {listingsWithCoordinates.length}
              </span>{' '}
              location{listingsWithCoordinates.length !== 1 ? 's' : ''} on the
              map
              {items.length > listingsWithCoordinates.length && (
                <> (out of {items.length} total listings)</>
              )}
            </p>
          </div>
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

const MapWithNoSSR = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
})

export default function ListingsMap(props: MapProps) {
  return <MapWithNoSSR {...props} />
}
