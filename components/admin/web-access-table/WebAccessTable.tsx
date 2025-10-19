import { memo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@auth-client'
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
import useRemoveWebAccess from '@hooks/web-access/useRemoveWebAccess'

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
  webAccess: any[]
  isOwner?: boolean
  webId?: number
  isInAdminSection?: boolean
}

const WebAccessTable = ({
  webAccess,
  isOwner,
  webId,
  isInAdminSection = false,
}: Props) => {
  const router = useRouter()
  const { data: session } = useSession()
  const [
    isRemoveConfirmationDialogOpenWithUserEmail,
    setIsRemoveConfirmationDialogOpenWithUserEmail,
  ] = useState<{ userEmail: string }>()
  const { mutate: removeWebAccess } = useRemoveWebAccess()

  const handleRemove = () => {
    const { userEmail } = isRemoveConfirmationDialogOpenWithUserEmail
    removeWebAccess({ userEmail, webId })
  }

  const handleRowClick = (userId: string) => {
    if (!isInAdminSection) {
      return
    }

    router.push(`/admin/users/${userId}`)
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
              {isOwner && webAccess.some((p) => p.role !== 'OWNER') && (
                <TableHead>Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {webAccess.map((webAccess) => {
              const webAccessKey = webAccess.owner
                ? `owner-${webAccess.id}`
                : `permission-${webAccess.id}`

              return (
                <TableRow
                  key={webAccessKey}
                  onClick={() => handleRowClick(webAccess.user.id)}
                  className={isInAdminSection ? 'cursor-pointer' : undefined}
                >
                  {columns.map((column, index) => {
                    if (column.accessor === 'email') {
                      const emailAddress = webAccess.email
                      const name = webAccess.user.name
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
                      if (webAccess.role === 'OWNER') {
                        return (
                          <TableCell key={`1-${index}`}>
                            <div className="flex gap-2">
                              <Badge>Owner</Badge>
                              {!webAccess.user.emailVerified && (
                                <Badge variant="secondary">
                                  Invite pending
                                </Badge>
                              )}
                              {webAccess.user.role === 'admin' && (
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
                            {!webAccess.user.emailVerified && (
                              <Badge variant="secondary">Invite pending</Badge>
                            )}
                            {webAccess.user.role === 'admin' && (
                              <Badge variant="secondary">Admin</Badge>
                            )}
                          </div>
                        </TableCell>
                      )
                    }
                  })}

                  {isOwner ||
                    (session?.user.role === 'admin' &&
                      session?.user?.email !== webAccess.email &&
                      !webAccess.owner && (
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsRemoveConfirmationDialogOpenWithUserEmail({
                                userEmail: webAccess.email,
                              })
                            }}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      ))}
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

export default memo(WebAccessTable)
