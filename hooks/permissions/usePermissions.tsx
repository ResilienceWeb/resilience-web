import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

async function fetchPermissionsRequest() {
  const response = await fetch('/api/permissions')
  const data = await response.json()
  const listingIds = data.permission.listings.map((l) => l.id)
  const siteIds = data.permission.locations.map((l) => l.id)
  return { listingIds, siteIds, permission: data.permission }
}

export default function usePermissions() {
  const { data: session } = useSession()

  const {
    data: permissions,
    isLoading,
    isError,
  } = useQuery(['permission'], fetchPermissionsRequest, {
    enabled: Boolean(session),
  })

  return {
    permissions,
    isLoading,
    isError,
  }
}
