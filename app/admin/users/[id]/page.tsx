'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { authClient } from '@auth-client'
import DeleteConfirmationDialog from '@components/admin/delete-confirmation-dialog'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Spinner } from '@components/ui/spinner'
import { Table, TableBody, TableCell, TableRow } from '@components/ui/table'

type AdminListUsersResponse = {
  users: Array<Record<string, any>>
  total: number
  limit?: number
  offset?: number
}

export default function UserPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const userId = params?.id

  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<Record<string, any> | null>(null)
  const [isBanOpen, setIsBanOpen] = useState(false)
  const [isBanning, setIsBanning] = useState(false)
  const [isUnbanning, setIsUnbanning] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    if (!userId) {
      return
    }

    let cancelled = false
    const run = async () => {
      setIsLoading(true)
      try {
        const resUsers: any = await authClient.admin.listUsers({
          query: {
            filterField: 'id',
            filterValue: userId,
            filterOperator: 'eq',
            limit: 1,
          },
        })
        const usersPayload: AdminListUsersResponse | undefined =
          (resUsers?.data as AdminListUsersResponse) ?? resUsers

        const found = usersPayload?.users?.[0] ?? null

        if (cancelled) return
        setUser(found)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [userId, router])

  const roleLabel = useMemo(() => {
    const role = user?.role
    if (Array.isArray(role)) return role.join(', ')
    return role ?? '-'
  }, [user])

  if (isLoading) return <Spinner />
  if (!user) return <div className="text-muted-foreground">User not found.</div>

  const handleBan = async () => {
    if (!userId) return
    try {
      setIsBanning(true)
      await authClient.admin.banUser({ userId })
      setUser((prev) => (prev ? { ...prev, banned: true } : prev))
      setIsBanOpen(false)
    } finally {
      setIsBanning(false)
    }
  }

  const handleUnban = async () => {
    if (!userId) return
    try {
      setIsUnbanning(true)
      await authClient.admin.unbanUser({ userId })
      setUser((prev) => (prev ? { ...prev, banned: false } : prev))
    } finally {
      setIsUnbanning(false)
    }
  }

  const handleRemove = async () => {
    if (!userId) return
    try {
      setIsRemoving(true)
      await authClient.admin.removeUser({
        userId,
      })
      setIsRemoveOpen(false)
      router.push('/admin/users')
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">User</h1>
          <p className="text-muted-foreground">
            Details for {user.name || user.email || user.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user.banned ? (
            <Button onClick={handleUnban} disabled={isUnbanning}>
              {isUnbanning ? 'Unbanning...' : 'Unban'}
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => setIsBanOpen(true)}
              disabled={isBanning}
            >
              {isBanning ? 'Banning...' : 'Ban'}
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => setIsRemoveOpen(true)}
            disabled={isRemoving}
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="w-56 font-medium text-muted-foreground">
                ID
              </TableCell>
              <TableCell className="break-all">{user.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="w-56 font-medium text-muted-foreground">
                Name
              </TableCell>
              <TableCell>{user.name || '-'}</TableCell>
            </TableRow>
            {user.image ? (
              <TableRow>
                <TableCell className="w-56 font-medium text-muted-foreground">
                  Image
                </TableCell>
                <TableCell className="break-all">{user.image}</TableCell>
              </TableRow>
            ) : null}
            <TableRow>
              <TableCell className="w-56 font-medium text-muted-foreground">
                Email
              </TableCell>
              <TableCell>{user.email || '-'}</TableCell>
            </TableRow>
            {'emailVerified' in user ? (
              <TableRow>
                <TableCell className="w-56 font-medium text-muted-foreground">
                  Email Verified
                </TableCell>
                <TableCell>{user.emailVerified ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ) : null}
            <TableRow>
              <TableCell className="w-56 font-medium text-muted-foreground">
                Role
              </TableCell>
              <TableCell>
                {roleLabel === '-' ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  <Badge variant="secondary">{roleLabel}</Badge>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="w-56 font-medium text-muted-foreground">
                Status
              </TableCell>
              <TableCell>
                {user.banned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : (
                  <Badge>Active</Badge>
                )}
              </TableCell>
            </TableRow>
            {user.banReason ? (
              <TableRow>
                <TableCell className="w-56 font-medium text-muted-foreground">
                  Ban Reason
                </TableCell>
                <TableCell>{user.banReason}</TableCell>
              </TableRow>
            ) : null}
            {user.banExpiresAt || user.banExpiresIn ? (
              <TableRow>
                <TableCell className="w-56 font-medium text-muted-foreground">
                  Ban Expires
                </TableCell>
                <TableCell>
                  {user.banExpiresAt
                    ? new Date(user.banExpiresAt).toLocaleString('en-GB')
                    : (user.banExpiresIn ?? '-')}
                </TableCell>
              </TableRow>
            ) : null}
            <TableRow>
              <TableCell className="w-56 font-medium text-muted-foreground">
                Created
              </TableCell>
              <TableCell>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleString('en-GB')
                  : '-'}
              </TableCell>
            </TableRow>
            {user.updatedAt ? (
              <TableRow>
                <TableCell className="w-56 font-medium text-muted-foreground">
                  Updated
                </TableCell>
                <TableCell>
                  {new Date(user.updatedAt).toLocaleString('en-GB')}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationDialog
        isOpen={isBanOpen}
        onClose={() => setIsBanOpen(false)}
        description="Are you sure you want to ban this user? They won't be able to sign in and all sessions will be revoked."
        titleLabel="Ban user"
        buttonLabel={isBanning ? 'Banning...' : 'Ban user'}
        handleRemove={handleBan as any}
      />

      <DeleteConfirmationDialog
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        description="Are you sure you want to remove this user? This action is irreversible."
        titleLabel="Remove user"
        buttonLabel={isRemoving ? 'Removing...' : 'Remove user'}
        handleRemove={handleRemove as any}
      />
    </div>
  )
}
