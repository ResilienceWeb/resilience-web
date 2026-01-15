'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import posthog from 'posthog-js'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Spinner } from '@components/ui/spinner'

// UK center coordinates (approximately central England)
const UK_CENTER: [number, number] = [24.5, -72.5]
const UK_ZOOM = 17

function createWebMarkerIcon() {
  const iconHtml = `
    <div style="
      background: linear-gradient(135deg, #3A8159 0%, #2d6847 100%);
      border-radius: 50%;
      height: 36px;
      width: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(58, 129, 89, 0.4);
      border: 3px solid white;
      transition: transform 0.2s ease;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="white"/>
        <path d="M12 2C12 2 12 12 12 12" stroke="white" stroke-width="2"/>
        <path d="M12 12C12 12 12 22 12 22" stroke="white" stroke-width="2"/>
        <path d="M2 12C2 12 12 12 12 12" stroke="white" stroke-width="2"/>
        <path d="M12 12C12 12 22 12 22 12" stroke="white" stroke-width="2"/>
      </svg>
    </div>
  `

  return L.divIcon({
    html: iconHtml,
    className: 'web-marker-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

// Function to check if a web was created less than 4 months ago
const isNewWeb = (createdAt: string | Date | null) => {
  if (!createdAt) return false

  const creationDate = new Date(createdAt)
  const fourMonthsAgo = new Date()
  fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4)

  return creationDate > fourMonthsAgo
}

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
    } else if (markers.length === 1) {
      map.setView(markers[0], 12)
    }
  }, [map, markers])

  return null
}

function MapComponent({ webs = [] }: WebsMapProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [markerIcon, setMarkerIcon] = useState<L.DivIcon | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Fix Leaflet default icon issue
    import('../../../components/listings-map/leaflet-icon-fix')

    // Create marker icon after component mounts (client-side only)
    setMarkerIcon(createWebMarkerIcon())

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
  const webUrl = `${PROTOCOL}://${web.slug}.${REMOTE_HOSTNAME}`

  return (
    <div className="flex flex-col gap-3 p-1">
      {web.image && (
        <div className="relative h-36 w-full overflow-hidden rounded-lg">
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

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-900">{web.title}</h3>

        <Button
          onClick={() => {
            posthog.capture('web-popup-explore-click', { webId: web.id })
            // TODO
            // window.open(webUrl, '_blank')
          }}
          className="w-full"
        >
          Explore Web
        </Button>
      </div>
    </div>
  )
}

const WebsMapWithNoSSR = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-7xl px-4 py-8" id="webs-map">
      <h2 className="mb-6 text-center text-4xl font-bold tracking-tight text-gray-900">
        Find Resilience Webs near you in the UK
      </h2>
      <div className="flex h-[600px] w-full items-center justify-center rounded-2xl bg-gray-50">
        <Spinner />
      </div>
    </div>
  ),
})

export default function WebsMap(props: WebsMapProps) {
  return <WebsMapWithNoSSR {...props} />
}
