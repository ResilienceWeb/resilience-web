import { useQuery } from '@tanstack/react-query'

async function fetchPermissionsRequest() {
  const response = await fetch('/api/permissions/all')
  const data = await response.json()
  const { permissions } = data
  return permissions
}

export default function usePermissions() {
  const {
    data: permissions,
    isLoading,
    isError,
  } = useQuery(['permission'], fetchPermissionsRequest)

  return {
    permissions,
    isLoading,
    isError,
  }
}
