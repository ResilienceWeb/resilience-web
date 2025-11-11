'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface ListingMapProps {
  latitude: number
  longitude: number
  locationDescription: string
  hideDescription?: boolean
}

export default function ListingMap({
  latitude,
  longitude,
  locationDescription,
  hideDescription = false,
}: ListingMapProps) {
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`

  return (
    <div>
      {!hideDescription && (
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold">{locationDescription}</p>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-600 hover:text-green-800 underline"
          >
            Get Directions
          </a>
        </div>
      )}
      <div className="h-[300px] overflow-hidden rounded-lg">
        <MapContainer
          center={[latitude, longitude]}
          zoom={17}
          className="h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={{ lat: latitude, lng: longitude }}
            icon={L.icon({
              iconUrl: `${window.location.origin}/marker-icon.png`,
              iconSize: [25, 41],
            })}
          >
            <Popup>{locationDescription}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  )
}
