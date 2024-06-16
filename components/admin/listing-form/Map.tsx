import { useEffect, useMemo, useRef, useState } from 'react'
import { Text, chakra } from '@chakra-ui/react'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'
import { GoogleProvider, GeoSearchControl } from 'leaflet-geosearch'
import { useFormikContext } from 'formik'

const provider = new GoogleProvider({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
})
// @ts-ignore
const geoSearchControl = new GeoSearchControl({
  provider,
  style: 'bar',
  marker: {
    draggable: true,
  },
})

const DEFAULT_CENTER = {
  lat: 51.505,
  lng: -0.09,
}

const MapContent = ({ latitude, longitude }) => {
  const { setFieldValue } = useFormikContext<any>()
  const map = useMap()
  const markerRef = useRef(null)
  const initialCenter =
    latitude && longitude ? { lat: latitude, lng: longitude } : DEFAULT_CENTER
  const [position, setPosition] = useState(initialCenter)

  useMapEvents({
    click(event) {
      // map.locate()
      setPosition(event.latlng)
      setFieldValue('location', {
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      })
    },
    // locationfound(e) {
    //   // setPosition(e.latlng)
    //   map.flyTo(e.latlng, map.getZoom())
    // },
  })

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
    })
  })

  map.on('geosearch/marker/dragend', (event) => {
    setPosition({
      // @ts-ignore
      lat: event.location.lat,
      // @ts-ignore
      lng: event.location.lng,
    })
    setFieldValue('location', {
      // @ts-ignore
      latitude: event.location.lat,
      // @ts-ignore
      longitude: event.location.lng,
    })
  })

  useEffect(() => {
    map.addControl(geoSearchControl)

    return () => {
      map.removeControl(geoSearchControl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          setPosition(marker.getLatLng())
          setFieldValue('location', {
            latitude: marker.getLatLng().lat,
            longitude: marker.getLatLng().lng,
          })
        }
      },
    }),
    [setFieldValue],
  )

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={position}
        eventHandlers={eventHandlers}
        draggable
        ref={markerRef}
      >
        {/* <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup> */}
      </Marker>
    </>
  )
}

const Map = ({ latitude, longitude }) => {
  return (
    <chakra.div mt="0.5rem">
      <Text color="gray.700" fontStyle="italic" fontSize="sm" padding="0.5rem">
        Beta: this feature is currently under construction. Feel free to select
        a location for this listing, however note that it is not currently
        displayed anywhere.
      </Text>
      <MapContainer
        center={[
          latitude ?? DEFAULT_CENTER.lat,
          longitude ?? DEFAULT_CENTER.lng,
        ]}
        zoom={13}
      >
        <MapContent latitude={latitude} longitude={longitude} />
      </MapContainer>
    </chakra.div>
  )
}

export default Map
