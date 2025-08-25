import { useQuery } from '@tanstack/react-query'
import { useSession } from '@auth-client'

async function getUserRequest() {
  const response = await fetch(`/api/users`)

  const responseJson = await response.json()
  const { data: user } = responseJson
  return user
}

export default function useCurrentUser() {
  const { data: session } = useSession()
  const {
    data: user,
    isPending,
    isSuccess,
  } = useQuery({
    queryKey: ['user'],
    queryFn: getUserRequest,
    enabled: Boolean(session),
  })

  return {
    user,
    isPending,
    isSuccess,
  }
}
