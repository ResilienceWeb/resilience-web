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

const getLatestListingUpdate = (listings) => {
  if (!listings?.length) return null

  let latestDate = null
  for (const listing of listings) {
    if (!listing.updatedAt) continue
    const date = new Date(listing.updatedAt)
    if (!latestDate || date > latestDate) {
      latestDate = date
    }
  }
  return latestDate
}

const getLastActivityDate = (web) => {
  const webLastUpdated = web.updatedAt ? new Date(web.updatedAt) : null
  const listingsLastUpdated = getLatestListingUpdate(web.listings)

  if (!webLastUpdated) return listingsLastUpdated
  if (!listingsLastUpdated) return webLastUpdated

  return new Date(
    Math.max(webLastUpdated.getTime(), listingsLastUpdated.getTime()),
  )
}

const isWebActive = (web) => {
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const lastActivity = getLastActivityDate(web)
  if (!lastActivity) return false

  return lastActivity > threeMonthsAgo
}

const formatDate = (date) => {
  return Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long',
  }).format(date)
}

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
              .sort((web1, web2) => {
                // First sort by published status
                if (web1.published !== web2.published) {
                  return web2.published ? 1 : -1 // Published webs go first
                }

                // Then sort by last activity date
                const date1 = getLastActivityDate(web1)
                const date2 = getLastActivityDate(web2)

                if (!date1 && !date2) return 0
                if (!date1) return 1
                if (!date2) return -1

                return date2.getTime() - date1.getTime()
              })
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
                        {!isWebActive(web) && (
                          <Badge variant="secondary" className="mt-2">
                            Last activity:{' '}
                            {formatDate(getLastActivityDate(web))}
                          </Badge>
                        )}
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
