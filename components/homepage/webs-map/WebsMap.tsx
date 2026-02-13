'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import '@styles/font-awesome.css'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import posthog from 'posthog-js'
import { getWebUrl } from '@helpers/config'
import { createCustomIcon } from '@helpers/map'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Spinner } from '@components/ui/spinner'

// Function to check if a web was created less than 4 months ago
const isNewWeb = (createdAt: string | Date | null) => {
  if (!createdAt) return false

  const creationDate = new Date(createdAt)
  const fourMonthsAgo = new Date()
  fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4)

  return creationDate > fourMonthsAgo
}

// UK center coordinates (approximately central England)
const UK_CENTER: [number, number] = [54.5, -2]
const UK_ZOOM = 6

interface Web {
  id: number
  title: string
  slug: string
  image: string | null
  createdAt: string | Date
  location?: {
    latitude: number
    longitude: number
    description?: string
  } | null
}

interface WebsMapProps {
  webs: Web[]
}

function FitBoundsToMarkers({ markers }: { markers: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (markers.length > 1) {
      const bounds = L.latLngBounds(
        markers.map((coords) => L.latLng(coords[0], coords[1])),
      )
      map.fitBounds(bounds, { padding: [20, 20] })
      // Ensure minimum zoom level of 6 for better UK focus
      if (map.getZoom() < 6) {
        map.setZoom(6)
      }
    } else if (markers.length === 1) {
      map.setView(markers[0], 12)
    }
  }, [map, markers])

  return null
}

function WebsMap({ webs = [] }: WebsMapProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [markerIcon, setMarkerIcon] = useState<L.DivIcon | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Fix Leaflet default icon issue
    import('../../../components/listings-map/leaflet-icon-fix')

    // Create marker icon after component mounts (client-side only)
    setMarkerIcon(createCustomIcon('City', '#3A8159'))

    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const websWithLocation = webs.filter(
    (web) => web.location?.latitude && web.location?.longitude,
  )

  const markerPositions = websWithLocation.map(
    (web) =>
      [web.location.latitude, web.location.longitude] as [number, number],
  )

  const handleCreateWebClick = () => {
    posthog.capture('create-new-web-click')
    router.push('/auth/signup')
  }

  if (isLoading || !markerIcon) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8" id="webs-map">
        <h2 className="mb-6 text-center text-4xl font-bold tracking-tight text-gray-900">
          Find Resilience Webs near you in the UK
        </h2>
        <div className="flex h-[600px] w-full items-center justify-center rounded-2xl bg-gray-50">
          <Spinner />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8" id="webs-map">
      <h2 className="mb-6 text-center text-4xl font-bold tracking-tight text-gray-900">
        Find Resilience Webs near you in the UK
      </h2>

      <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-gray-200">
        <MapContainer
          center={UK_CENTER}
          zoom={UK_ZOOM}
          scrollWheelZoom={true}
          style={{ height: '600px', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {markerPositions.length > 0 && (
            <FitBoundsToMarkers markers={markerPositions} />
          )}

          {websWithLocation.map((web) => (
            <Marker
              key={web.id}
              position={[web.location.latitude, web.location.longitude]}
              icon={markerIcon}
            >
              <Popup className="web-popup" maxWidth={320} minWidth={280}>
                <WebPopupContent web={web} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleCreateWebClick}
          className="group flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-4 transition-all duration-200 hover:border-[#3A8159] hover:shadow-lg"
        >
          <div className="rounded-full bg-green-50 p-2 transition-colors group-hover:bg-green-100">
            <svg
              className="h-5 w-5 text-[#3A8159]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">
              Start mapping your local community
            </p>
            <p className="text-sm text-gray-500">Create a new resilience web</p>
          </div>
        </button>
      </div>
    </div>
  )
}

function WebPopupContent({ web }: { web: Web }) {
  const isNew = isNewWeb(web.createdAt)
  const router = useRouter()
  const webUrl = getWebUrl(web.slug)

  return (
    <div className="flex flex-col gap-2">
      {web.image && (
        <div className="relative h-36 w-full overflow-hidden rounded-t-lg">
          <Image
            src={web.image}
            alt={`${web.title} web`}
            fill
            className="object-cover"
          />
          {isNew && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm"
            >
              New
            </Badge>
          )}
        </div>
      )}

      <div className="px-4 pb-4">
        <h3 className="text-lg font-bold text-gray-900">{web.title}</h3>

        <Button
          onClick={() => {
            posthog.capture('web-popup-explore-click', { webId: web.id })
            router.push(webUrl)
          }}
          className="w-full"
        >
          Explore Web
        </Button>
      </div>
    </div>
  )
}

export default WebsMap
