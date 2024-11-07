import { useEffect, useRef, useState } from 'react'
import { Text, chakra } from '@chakra-ui/react'
import { useFormikContext } from 'formik'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch'

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

const MapContent = ({ latitude, longitude, locationDescription }) => {
  const { setFieldValue } = useFormikContext<any>()
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
    setFieldValue('location', {
      // @ts-ignore
      latitude: event.location.y,
      // @ts-ignore
      longitude: event.location.x,
      // @ts-ignore
      description: event.location.label,
    })
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
        <Marker position={position} ref={markerRef}>
          {/* <Popup>
            A pretty popup.
          </Popup> */}
        </Marker>
      )}
    </>
  )
}

const Map = ({ latitude, longitude, locationDescription }) => {
  return (
    <chakra.div mt="0.5rem">
      <Text color="gray.700" fontStyle="italic" fontSize="sm" padding="0.5rem">
        The location can only be selected via adding an address via the search
        bar below. Selecting a location without an address is not supported.
      </Text>
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
    </chakra.div>
  )
}

export default Map
