import { memo } from 'react'
import { useSession } from 'next-auth/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table'
import { Badge } from '@components/ui/badge'

const columns = [
  {
    Header: 'Email',
    accessor: 'email',
  },
  {
    Header: 'Permissions',
    accessor: 'webs',
  },
]

const PermissionsTable = ({ permissions }) => {
  const { data: session } = useSession()

  return (
    <div className="mb-8 rounded-lg border bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={`heading-${index}`}>{column.Header}</TableHead>
            ))}
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
                        <div className="flex flex-col space-y-1">
                          <span className="font-semibold">{name}</span>
                          <span>
                            {emailAddress}
                            {session?.user?.email === emailAddress && ' (You)'}
                          </span>
                        </div>
                      </TableCell>
                    )
                  }

                  if (column.accessor === 'webs') {
                    if (permission.owner === true) {
                      return (
                        <TableCell key={`1-${index}`}>
                          <Badge>Owner</Badge>
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
                        </div>
                      </TableCell>
                    )
                  }
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default memo(PermissionsTable)
