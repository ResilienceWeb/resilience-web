'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import NextLink from 'next/link'
import L from 'leaflet'
import CategoryTag from '@components/category-tag'

interface MapProps {
  items?: any[]
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

  useEffect(() => {
    // Import the icon fix only on the client side
    import('./leaflet-icon-fix')

    // Simulate loading time for map initialization
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const defaultCenter = [52.401, 0.263]
  const defaultZoom = 14

  const itemsWithCoordinates = items.filter(
    (item) => item.location?.latitude && item.location?.longitude,
  )

  // Create array of marker positions for the FitBoundsToMarkers component
  const markerPositions = itemsWithCoordinates.map(
    (item) =>
      [
        parseFloat(item.location.latitude),
        parseFloat(item.location.longitude),
      ] as [number, number],
  )

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex h-[calc(100vh-150px)] w-full flex-col items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      ) : itemsWithCoordinates.length === 0 ? (
        <div className="flex h-[calc(100vh-150px)] w-full flex-col items-center justify-center bg-gray-50">
          <div className="max-w-md text-center">
            <h3 className="mb-2 text-xl font-semibold">
              No locations to display
            </h3>
            <p className="text-gray-600">
              None of the current items have location data available. Try
              adjusting your filters or switching to the List view.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b bg-white p-2 shadow-sm">
            <p className="text-sm text-gray-600">
              Displaying{' '}
              <span className="font-semibold">
                {itemsWithCoordinates.length}
              </span>{' '}
              location{itemsWithCoordinates.length !== 1 ? 's' : ''} on the map
              {items.length > itemsWithCoordinates.length && (
                <> (out of {items.length} total items)</>
              )}
            </p>
          </div>
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

            {/* Fit bounds to show all markers */}
            {markerPositions.length > 0 && (
              <FitBoundsToMarkers markers={markerPositions} />
            )}

            {/* Display markers for items with coordinates */}
            {itemsWithCoordinates.map((item) => (
              <Marker
                key={item.id}
                position={[
                  parseFloat(item.location.latitude),
                  parseFloat(item.location.longitude),
                ]}
              >
                <Popup>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold">{item.label}</h3>
                    {item.description && (
                      <p
                        className="m-0 text-sm text-gray-600"
                        dangerouslySetInnerHTML={{
                          __html:
                            item.description.length > 100
                              ? `${item.description.substring(0, 100)}...`
                              : item.description,
                        }}
                      ></p>
                    )}
                    {item.category && (
                      <CategoryTag colorHex={item.category.color}>
                        {item.category.label}
                      </CategoryTag>
                    )}
                    <NextLink
                      href={`/${item.slug}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View details
                    </NextLink>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </>
      )}
    </div>
  )
}

// Dynamically import leaflet-related components to avoid SSR issues
const MapWithNoSSR = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
})

export default function Map(props: MapProps) {
  return <MapWithNoSSR {...props} />
}
