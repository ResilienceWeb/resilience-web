import { Box, Text } from '@chakra-ui/react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function ListingMap({
  latitude,
  longitude,
  locationDescription,
}) {
  return (
    <Box>
      <Text fontWeight="600">{locationDescription}</Text>
      <MapContainer
        center={[latitude, longitude]}
        zoom={17}
        style={{ height: '300px', borderRadius: '10px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={{ lat: latitude, lng: longitude }}>
          <Popup>{locationDescription}</Popup>
        </Marker>
      </MapContainer>
    </Box>
  )
}
