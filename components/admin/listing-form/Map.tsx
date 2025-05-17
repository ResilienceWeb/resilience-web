import { useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'
import 'leaflet/dist/leaflet.css'
import { cn } from '@components/lib/utils'

const provider = new OpenStreetMapProvider()

const geoSearchControl = GeoSearchControl({
  provider,
  style: 'bar',
  showMarker: false,
})

const DEFAULT_CENTER = {
  lat: 51.505,
  lng: -0.09,
}

interface MapContentProps {
  latitude?: number
  longitude?: number
  locationDescription?: string
}

const MapContent = ({
  latitude,
  longitude,
  locationDescription,
}: MapContentProps) => {
  const { setValue } = useFormContext()
  const map = useMap()
  const markerRef = useRef(null)
  const initialCenter =
    latitude && longitude ? { lat: latitude, lng: longitude } : undefined
  const [position, setPosition] = useState(initialCenter)

  map.on('geosearch/showlocation', (event) => {
    setPosition({
      // @ts-ignore
      lat: event.location.y,
      // @ts-ignore
      lng: event.location.x,
    })
    setValue(
      'location',
      {
        // @ts-ignore
        latitude: event.location.y,
        // @ts-ignore
        longitude: event.location.x,
        // @ts-ignore
        description: event.location.label,
      },
      { shouldValidate: true },
    )
  })

  useEffect(() => {
    if (locationDescription) {
      geoSearchControl.searchElement.input.value = locationDescription
    }

    if (locationDescription === undefined) {
      geoSearchControl.searchElement.input.value = ''
    }
  }, [locationDescription])

  useEffect(() => {
    map.addControl(geoSearchControl)

    return () => {
      map.removeControl(geoSearchControl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {position && (
        <Marker
          position={position}
          ref={markerRef}
          icon={L.icon({
            iconUrl: `${window.location.origin}/marker-icon.png`,
          })}
        />
      )}
    </>
  )
}

interface MapProps {
  latitude?: number
  longitude?: number
  locationDescription?: string
  noPhysicalLocation?: boolean
}

const Map = ({
  latitude,
  longitude,
  locationDescription,
  noPhysicalLocation,
}: MapProps) => {
  return (
    <div
      className={cn(
        'mt-2',
        noPhysicalLocation ? 'pointer-events-none opacity-50' : 'opacity-100',
      )}
    >
      <p className="p-2 text-sm font-normal text-gray-700 italic">
        The location can only be selected by adding an address via the search
        bar below. Selecting a location without an address is not supported.
      </p>
      <MapContainer
        center={[
          latitude ?? DEFAULT_CENTER.lat,
          longitude ?? DEFAULT_CENTER.lng,
        ]}
        zoom={14}
        style={{ height: '300px' }}
      >
        <MapContent
          latitude={latitude}
          longitude={longitude}
          locationDescription={locationDescription}
        />
      </MapContainer>
    </div>
  )
}

export default Map
