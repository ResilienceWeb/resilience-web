import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

async function fetchAllPermissionsRequest() {
  const response = await fetch('/api/permissions/all')
  const data = await response.json()
  const { permissions } = data
  return permissions
}

async function fetchPermissionsRequest() {
  const response = await fetch('/api/permissions')
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
  } = useQuery(
    ['all-permissions'],
    sessionStatus === 'authenticated' && session.user.admin
      ? fetchAllPermissionsRequest
      : fetchPermissionsRequest,
  )

  return {
    permissions,
    isLoading,
    isError,
  }
}
