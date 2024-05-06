import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

async function getUserRequest({ queryKey }) {
  const [_key, { email }] = queryKey
  const response = await fetch(`/api/users/${encodeURIComponent(email)}`)

  const responseJson = await response.json()
  const { data: user } = responseJson
  return user
}

export default function useCurrentUser() {
  const { data: session, status: sessionStatus } = useSession()
  const {
    data: user,
    isPending,
    isSuccess,
  } = useQuery({
    queryKey: ['user', { email: session?.user?.email }],
    queryFn: getUserRequest,
    enabled: sessionStatus === 'authenticated',
  })

  return {
    user,
    isPending,
    isSuccess,
  }
}
