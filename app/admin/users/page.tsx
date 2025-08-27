'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@auth-client'
import { Badge } from '@components/ui/badge'
import { Spinner } from '@components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table'

type AdminListUsersResponse = {
  users: Array<{
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    createdAt?: string | Date
    role?: string | string[]
    banned?: boolean
  }>
  total: number
  limit?: number
  offset?: number
}

const columns = [
  { Header: 'User' },
  { Header: 'Email' },
  { Header: 'Role' },
  { Header: 'Status' },
]

export default function UsersPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<AdminListUsersResponse | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      const res: any = await authClient.admin.listUsers({
        query: { limit: 100 },
      })

      // Better Auth client generally returns { data, error }
      const payload: AdminListUsersResponse | undefined =
        (res?.data as AdminListUsersResponse) ?? res

      if (!payload || !Array.isArray(payload.users)) {
        throw new Error('Unexpected response from listUsers')
      }
      setData(payload)
      setIsLoading(false)
    }
    fetchUsers()
  }, [])

  const users = useMemo(() => data?.users ?? [], [data])

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage users</p>
      </div>

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
            {users.map((user) => {
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
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
