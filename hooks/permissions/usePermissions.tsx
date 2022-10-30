import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

async function fetchPermissionsRequest() {
  const response = await fetch('/api/permissions')
  return await response.json()
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
