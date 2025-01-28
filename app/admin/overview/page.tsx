'use client'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table'
import { Badge } from '@components/ui/badge'
import { Spinner } from '@components/ui/spinner'
import useWebs from '@hooks/webs/useWebs'

const columns = [
  {
    Header: 'Web title',
    accessor: 'title',
  },
  {
    Header: 'Status',
  },
  {
    Header: 'Details',
  },
]

export default function OverviewPage() {
  const router = useRouter()
  const { isPending: isLoadingWebs, webs } = useWebs({ withAdminInfo: true })

  if (isLoadingWebs) {
    return <Spinner />
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Manage Resilience Web instances</p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column.Header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {webs
              .sort(
                (web1, web2) =>
                  new Date(web2.createdAt).valueOf() -
                  new Date(web1.createdAt).valueOf(),
              )
              .map((web) => {
                const teamMembersCount =
                  web.ownerships.length + web.permissions.length

                return (
                  <TableRow
                    key={web.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      router.push(`/admin/overview/${web.slug}`)
                    }}
                  >
                    <TableCell className="font-medium">{web.title}</TableCell>
                    <TableCell>
                      {web.published ? (
                        <Badge>Published</Badge>
                      ) : (
                        <Badge variant="secondary">Private</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">
                            {web.listings.length}
                          </span>{' '}
                          listings
                        </p>
                        <p>
                          <span className="font-medium">
                            {teamMembersCount}
                          </span>{' '}
                          {teamMembersCount === 1
                            ? 'team member'
                            : 'team members'}
                        </p>
                      </div>
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
