'use client'
import { useRouter } from 'next/navigation'
import { PiWarningCircleBold } from 'react-icons/pi'
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
    Header: 'Web',
    accessor: 'title',
  },
  {
    Header: 'Status',
  },
  {
    Header: '',
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

  const totalWebs = webs.length
  const publishedWebs = webs.filter((web) => web.published).length
  const inactiveWebs = webs.filter((web) => !isWebActive(web)).length

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Manage Resilience Web instances</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-muted-foreground text-sm font-medium">
            Total Webs
          </div>
          <div className="mt-2 text-2xl font-bold">{totalWebs}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-muted-foreground text-sm font-medium">
            Published
          </div>
          <div className="mt-2 text-2xl font-bold">{publishedWebs}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-muted-foreground text-sm font-medium">
            Inactive Webs
          </div>
          <div className="mt-2 text-2xl font-bold">{inactiveWebs}</div>
        </div>
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

                const hasNoImage = !web.image
                const noDescription = !web.description

                return (
                  <TableRow
                    key={web.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      router.push(`/admin/overview/${web.slug}`)
                    }}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{web.title}</div>
                        {(hasNoImage || noDescription) && (
                          <div className="flex flex-wrap gap-1">
                            {hasNoImage && (
                              <div className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs">
                                <PiWarningCircleBold className="h-4 w-4" />
                                <span>No image</span>
                              </div>
                            )}
                            {noDescription && (
                              <div className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs">
                                <PiWarningCircleBold className="h-4 w-4" />
                                <span>No description</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        {web.published ? (
                          <Badge>Published</Badge>
                        ) : (
                          <Badge variant="secondary">Private</Badge>
                        )}
                        {!isWebActive(web) ? (
                          <div className="space-y-1">
                            <Badge variant="secondary">Inactive</Badge>
                            <div className="text-muted-foreground text-xs">
                              Last activity:{' '}
                              {formatDate(getLastActivityDate(web))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-xs">
                            Last activity {formatDate(getLastActivityDate(web))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">
                            {web.listings.length}
                          </span>
                          <span className="text-muted-foreground">
                            listings
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">
                            {teamMembersCount}
                          </span>
                          <span className="text-muted-foreground">
                            {teamMembersCount === 1
                              ? 'team member'
                              : 'team members'}
                          </span>
                        </div>
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
