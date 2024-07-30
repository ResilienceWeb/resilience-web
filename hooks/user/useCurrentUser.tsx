import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

async function getUserRequest() {
  const response = await fetch(`/api/users`)

  const responseJson = await response.json()
  const { data: user } = responseJson
  return user
}

export default function useCurrentUser() {
  const { status: sessionStatus } = useSession()
  const {
    data: user,
    isPending,
    isSuccess,
  } = useQuery({
    queryKey: ['user'],
    queryFn: getUserRequest,
    enabled: sessionStatus === 'authenticated',
  })

  return {
    user,
    isPending,
    isSuccess,
  }
}
