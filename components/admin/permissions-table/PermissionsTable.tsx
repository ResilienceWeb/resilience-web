import { memo, useState } from 'react'
import { useSession } from 'next-auth/react'
import DeleteConfirmationDialog from '@components/admin/delete-confirmation-dialog'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table'
import useRemovePermission from '@hooks/permissions/useRemovePermission'

const columns = [
  {
    Header: 'Email',
    accessor: 'email',
  },
  {
    Header: 'Permissions',
    accessor: 'permissions',
  },
]

type Props = {
  permissions: any[]
  isOwner?: boolean
  webId?: number
}

const PermissionsTable = ({ permissions, isOwner, webId }: Props) => {
  const { data: session } = useSession()
  const [
    isRemoveConfirmationDialogOpenWithUserEmail,
    setIsRemoveConfirmationDialogOpenWithUserEmail,
  ] = useState<{ userEmail: string }>()
  const { removePermission } = useRemovePermission()

  const handleRemove = () => {
    const { userEmail } = isRemoveConfirmationDialogOpenWithUserEmail
    removePermission({ userEmail, webId })
  }

  return (
    <>
      <div className="bg-card mb-8 rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={`heading-${index}`}>{column.Header}</TableHead>
              ))}
              {isOwner && permissions.some((p) => !p.owner) && (
                <TableHead>Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission) => {
              const permissionKey = permission.owner
                ? `owner-${permission.id}`
                : `permission-${permission.id}`

              return (
                <TableRow key={permissionKey}>
                  {columns.map((column, index) => {
                    if (column.accessor === 'email') {
                      const emailAddress = permission.email
                      const name = permission.user.name
                      return (
                        <TableCell key={`0-${index}`}>
                          <div className="flex flex-col">
                            <span className="font-semibold">{name}</span>
                            <span>
                              {emailAddress}
                              {session?.user?.email === emailAddress &&
                                ' (You)'}
                            </span>
                          </div>
                        </TableCell>
                      )
                    }

                    if (column.accessor === 'permissions') {
                      if (permission.owner === true) {
                        return (
                          <TableCell key={`1-${index}`}>
                            <div className="flex gap-2">
                              <Badge>Owner</Badge>
                              {!permission.user.emailVerified && (
                                <Badge variant="secondary">
                                  Invite pending
                                </Badge>
                              )}
                              {permission.user.admin && (
                                <Badge variant="secondary">Admin</Badge>
                              )}
                            </div>
                          </TableCell>
                        )
                      }

                      return (
                        <TableCell key={`2-${index}`}>
                          <div className="flex gap-2">
                            <Badge variant="secondary">Editor</Badge>
                            {!permission.user.emailVerified && (
                              <Badge variant="secondary">Invite pending</Badge>
                            )}
                            {permission.user.admin && (
                              <Badge variant="secondary">Admin</Badge>
                            )}
                          </div>
                        </TableCell>
                      )
                    }
                  })}

                  {isOwner &&
                    session?.user?.email !== permission.email &&
                    !permission.owner && (
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setIsRemoveConfirmationDialogOpenWithUserEmail({
                              userEmail: permission.email,
                            })
                          }
                        >
                          Remove
                        </Button>
                      </TableCell>
                    )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <DeleteConfirmationDialog
        isOpen={!!isRemoveConfirmationDialogOpenWithUserEmail}
        onClose={() => setIsRemoveConfirmationDialogOpenWithUserEmail(null)}
        handleRemove={handleRemove}
        description="Are you sure you want to remove this person from your team? They will lose access to your web."
        buttonLabel="Yes, remove them"
      />
    </>
  )
}

export default memo(PermissionsTable)
