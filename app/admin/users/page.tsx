'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Spinner } from '@components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table'
import { useUsers } from '@hooks/user/useUsers'

const columns = [
  { Header: 'User' },
  { Header: 'Email' },
  { Header: 'Role' },
  { Header: 'Status' },
]

export default function UsersPage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch] = useDebounce(searchInput, 300)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useUsers(debouncedSearch)

  const users = useMemo(() => {
    return data?.pages.flatMap((page) => page.users) ?? []
  }, [data])

  const totalUsers = data?.pages[0]?.total ?? 0
  const isSearching = debouncedSearch.trim().length > 0

  const handleClearSearch = () => {
    setSearchInput('')
  }

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[400px]">
  //       <Spinner />
  //     </div>
  //   )
  // }

  if (error) {
    return (
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage users</p>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">
            Failed to load users. Please try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            {isSearching ? (
              <>
                Search results for "{debouncedSearch}" ({totalUsers} found)
              </>
            ) : (
              <>Manage users ({totalUsers} total)</>
            )}
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index}>{column.Header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {isSearching ? (
                        <>No users found matching "{debouncedSearch}"</>
                      ) : (
                        <>No users found</>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const roleLabel = Array.isArray(user.role)
                    ? user.role.join(', ')
                    : user.role || '-'
                  return (
                    <TableRow
                      key={user.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        router.push(`/admin/users/${user.id}`)
                      }}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {user.name || '(No name)'}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            ID: {user.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        {user.email || '-'}
                      </TableCell>
                      <TableCell className="align-top">
                        {roleLabel === '-' ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          <Badge variant="secondary">{roleLabel}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        {user.banned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge>Active</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {hasNextPage && (
            <div className="p-4 border-t">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="w-full"
              >
                {isFetchingNextPage ? (
                  <>
                    <div className="mr-2 inline-block">
                      <Spinner />
                    </div>
                    Loading more users...
                  </>
                ) : (
                  `Load more users (${users.length} of ${totalUsers})`
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
