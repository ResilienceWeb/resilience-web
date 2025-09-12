import { useInfiniteQuery } from '@tanstack/react-query'
import { authClient } from '@auth-client'

type User = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  createdAt?: string | Date
  role?: string | string[]
  banned?: boolean
}

type UsersResponse = {
  users: User[]
  total: number
  limit?: number
  offset?: number
}

const USERS_PER_PAGE = 50

export function useUsers(searchQuery?: string) {
  const isSearching = searchQuery && searchQuery.trim().length > 0

  return useInfiniteQuery({
    queryKey: ['users', searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      // If searching, fetch more data to have enough results for client-side filtering
      const fetchLimit = isSearching ? 100 : USERS_PER_PAGE
      const queryParams: any = {
        limit: fetchLimit,
        offset: pageParam,
      }

      // Try server-side search first
      if (isSearching) {
        queryParams.filterField = 'email'
        queryParams.filterValue = searchQuery.trim()
        queryParams.filterOperator = 'contains'
      }

      const res: any = await authClient.admin.listUsers({
        query: queryParams,
      })

      // Better Auth client generally returns { data, error }
      const payload: UsersResponse | undefined =
        (res?.data as UsersResponse) ?? res

      if (!payload || !Array.isArray(payload.users)) {
        throw new Error('Unexpected response from listUsers')
      }

      // If server-side search didn't work (no results but we expect some),
      // fall back to client-side filtering
      if (isSearching && payload.users.length === 0 && pageParam === 0) {
        // Fetch all users for client-side search
        const allUsersRes: any = await authClient.admin.listUsers({
          query: { limit: 1000, offset: 0 },
        })
        const allUsersPayload: UsersResponse | undefined =
          (allUsersRes?.data as UsersResponse) ?? allUsersRes

        if (allUsersPayload && Array.isArray(allUsersPayload.users)) {
          // Client-side filtering
          const searchTerm = searchQuery.trim().toLowerCase()
          const filteredUsers = allUsersPayload.users.filter(
            (user) =>
              user.email?.toLowerCase().includes(searchTerm) ||
              user.name?.toLowerCase().includes(searchTerm) ||
              user.id.toLowerCase().includes(searchTerm),
          )

          return {
            users: filteredUsers.slice(pageParam, pageParam + USERS_PER_PAGE),
            total: filteredUsers.length,
            limit: USERS_PER_PAGE,
            offset: pageParam,
          }
        }
      }

      return payload
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentOffset = allPages.length * USERS_PER_PAGE
      const hasMore = currentOffset < lastPage.total
      return hasMore ? currentOffset : undefined
    },
    initialPageParam: 0,
  })
}
