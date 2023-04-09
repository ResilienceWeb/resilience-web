import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

async function fetchAllPermissionsRequest() {
  const response = await fetch('/api/permissions/all')
  const data = await response.json()
  const { permissions } = data
  return permissions
}

export default function usePermissions() {
  const { data: session, status: sessionStatus } = useSession()

  const {
    data: permissions,
    isLoading,
    isError,
  } = useQuery(['all-permissions'], fetchAllPermissionsRequest, {
    enabled: sessionStatus === 'authenticated' && session.user.admin,
  })

  return {
    permissions,
    isLoading,
    isError,
  }
}
