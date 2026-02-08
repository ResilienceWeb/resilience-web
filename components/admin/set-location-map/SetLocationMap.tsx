import { useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'
import 'leaflet/dist/leaflet.css'
import { cn } from '@components/lib/utils'

const provider = new OpenStreetMapProvider({
  params: {
    countrycodes: 'gb',
  },
})

const createGeoSearchControl = () =>
  GeoSearchControl({
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
  const geoSearchControlRef = useRef<ReturnType<
    typeof GeoSearchControl
  > | null>(null)
  const initialCenter =
    latitude && longitude ? { lat: latitude, lng: longitude } : undefined
  const [position, setPosition] = useState(initialCenter)

  useEffect(() => {
    const handleShowLocation = (event: any) => {
      const location = event.location || event
      setPosition({
        lat: location.y,
        lng: location.x,
      })
      setValue(
        'location',
        {
          latitude: location.y,
          longitude: location.x,
          description: location.label,
        },
        { shouldValidate: true, shouldDirty: true },
      )
    }

    const geoSearchControl = createGeoSearchControl()
    geoSearchControlRef.current = geoSearchControl

    geoSearchControl.searchElement.input.setAttribute('data-1p-ignore', 'true')
    map.addControl(geoSearchControl)

    map.on('geosearch/showlocation', handleShowLocation)

    // Clear form location when the reset button is clicked
    const handleReset = () => {
      setPosition(undefined)
      setValue('location', undefined, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
    geoSearchControl.resetButton.addEventListener('click', handleReset)

    // Workaround: Listen for clicks on result items directly
    // The leaflet-geosearch library has a bug where clicking results doesn't always fire the event
    const resultsContainer =
      geoSearchControl.searchElement.form.querySelector('.results')
    const handleResultClick = (e: Event) => {
      const target = e.target as HTMLElement
      const resultItem = target.closest('[data-key]')
      if (resultItem && geoSearchControl.resultList?.results) {
        const idx = Number(resultItem.getAttribute('data-key'))
        const result = geoSearchControl.resultList.results[idx]
        if (result) {
          // Manually trigger the location update
          setTimeout(() => {
            const newPosition = { lat: result.y, lng: result.x }
            setPosition(newPosition)
            map.setView(newPosition, map.getZoom())
            setValue(
              'location',
              {
                latitude: result.y,
                longitude: result.x,
                description: result.label,
              },
              { shouldValidate: true, shouldDirty: true },
            )
          }, 100)
        }
      }
    }
    resultsContainer?.addEventListener('click', handleResultClick)

    return () => {
      map.off('geosearch/showlocation', handleShowLocation)
      geoSearchControl.resetButton.removeEventListener('click', handleReset)
      resultsContainer?.removeEventListener('click', handleResultClick)
      map.removeControl(geoSearchControl)
    }
  }, [map, setValue])

  useEffect(() => {
    if (!geoSearchControlRef.current) return

    if (locationDescription) {
      geoSearchControlRef.current.searchElement.input.value =
        locationDescription
    } else {
      geoSearchControlRef.current.searchElement.input.value = ''
    }
  }, [locationDescription])

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
            iconSize: [25, 41],
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

const SetLocationMap = ({
  latitude,
  longitude,
  locationDescription,
  noPhysicalLocation,
}: MapProps) => {
  return (
    <div
      className={cn(
        noPhysicalLocation ? 'pointer-events-none opacity-50' : 'opacity-100',
      )}
    >
      <p className="py-2 text-xs font-normal text-yellow-700 italic">
        The location can only be selected by adding an address via the search
        bar below. Selecting a location without an address is not supported.
      </p>
      <MapContainer
        center={[
          latitude ?? DEFAULT_CENTER.lat,
          longitude ?? DEFAULT_CENTER.lng,
        ]}
        zoom={14}
        style={{ height: '300px', borderRadius: '8px' }}
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

export default SetLocationMap
