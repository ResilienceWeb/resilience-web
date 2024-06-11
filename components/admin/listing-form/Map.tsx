import { useEffect, useMemo, useRef, useState } from 'react'
import { chakra } from '@chakra-ui/react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'
import { GoogleProvider, GeoSearchControl } from 'leaflet-geosearch'
import { useEffectOnce } from '@hooks/application'

const provider = new GoogleProvider({
  apiKey: 'AIzaSyBxtqBPTrSNHjRKl8t0H2bZFIEHQ3Hrtfo',
})

const center = {
  lat: 51.505,
  lng: -0.09,
}

const MapContent = () => {
  const map = useMap()
  const markerRef = useRef(null)
  const [position, setPosition] = useState(center)

  useMapEvents({
    click(event) {
      // map.locate()
      console.log('clicked', event)
      setPosition(event.latlng)
    },
    // locationfound(e) {
    //   // setPosition(e.latlng)
    //   map.flyTo(e.latlng, map.getZoom())
    // },
  })

  useEffect(() => {
    // @ts-ignore
    const geoSearchControl = new GeoSearchControl({
      provider,
      style: 'bar',
    })
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
        }
      },
    }),
    [],
  )

  console.log({ position })

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
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </>
  )
}

const Map = () => {
  return (
    <chakra.div mt="0.5rem">
      <MapContainer center={[center.lat, center.lng]} zoom={13}>
        <MapContent />
      </MapContainer>
    </chakra.div>
  )
}

export default Map
