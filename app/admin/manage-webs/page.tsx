'use client'

import { useMemo, useState } from 'react'
import { PiWarningCircleBold } from 'react-icons/pi'
import { SlGlobe } from 'react-icons/sl'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useDebounceValue } from 'usehooks-ts'
import { isFeatureEnabled, FEATURES } from '@helpers/features'
import { getLastActivityDate, isWebActive } from '@helpers/webActivity'
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

const formatDate = (date) => {
  return Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long',
  }).format(date)
}

export default function DashboardPage() {
  const router = useRouter()
  const { isPending: isLoadingWebs, webs } = useWebs({ withAdminInfo: true })
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch] = useDebounceValue(searchInput, 300)

  const sortedWebs = useMemo(() => {
    if (!webs) return []
    return [...webs].sort((web1, web2) => {
      if (web1.published !== web2.published) {
        return web2.published ? 1 : -1
      }
      const date1 = getLastActivityDate(web1)
      const date2 = getLastActivityDate(web2)
      if (!date1 && !date2) return 0
      if (!date1) return 1
      if (!date2) return -1
      return date2.getTime() - date1.getTime()
    })
  }, [webs])

  const filteredWebs = useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase()
    if (!search) return sortedWebs
    return sortedWebs.filter((web) => web.title.toLowerCase().includes(search))
  }, [sortedWebs, debouncedSearch])

  if (isLoadingWebs) {
    return <Spinner />
  }

  const isSearching = debouncedSearch.trim().length > 0

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Manage webs</h1>
          <p className="text-muted-foreground">
            {isSearching && (
              <>
                Search results for &quot;{debouncedSearch}&quot; (
                {filteredWebs.length} found)
              </>
            )}
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search webs by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchInput('')}
              className="hover:bg-muted absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
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
            {filteredWebs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center">
                  <div className="text-muted-foreground">
                    {isSearching ? (
                      <>No webs found matching &quot;{debouncedSearch}&quot;</>
                    ) : (
                      <>No webs found</>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredWebs.map((web) => {
                const teamMembersCount = web.webAccess.length

                const hasNoImage = !web.image
                const noDescription = !web.description

                return (
                  <TableRow
                    key={web.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      router.push(`/admin/manage-webs/${web.slug}`)
                    }}
                  >
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="font-medium">{web.title}</div>
                        {(hasNoImage || noDescription) && (
                          <div className="flex flex-wrap gap-1">
                            {hasNoImage && (
                              <Badge variant="secondary">
                                <PiWarningCircleBold className="h-4 w-4" />
                                <span>No image</span>
                              </Badge>
                            )}
                            {noDescription && (
                              <Badge variant="secondary">
                                <PiWarningCircleBold className="h-4 w-4" />
                                <span>No description</span>
                              </Badge>
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

                        {isFeatureEnabled(FEATURES.showMap, web.features) && (
                          <Badge className="flex gap-1" variant="secondary">
                            <SlGlobe /> Geomapping enabled
                          </Badge>
                        )}

                        {!isWebActive(web) ? (
                          <div className="flex flex-col items-start gap-1">
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
                      <div className="flex flex-col gap-1 text-sm">
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
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
