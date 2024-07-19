import { useQuery } from '@tanstack/react-query'

export default function useCurrentUser() {
  const { data } = useQuery({
    queryKey: ['session'],
  })

  return {
    data,
  }
}
