'use client'

import { useState } from 'react'
import { HiEye, HiCursorClick, HiGlobe } from 'react-icons/hi'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Spinner } from '@components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table'
import useAnalytics from '@hooks/analytics/useAnalytics'

const PERIODS = [7, 30, 90] as const

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<number>(30)
  const { analytics, isPending } = useAnalytics(period)

  if (isPending) {
    return <Spinner />
  }

  const listings = analytics?.listings ?? []
  const webViews = analytics?.web?.view ?? 0
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0)
  const totalActionClicks = listings.reduce((sum, l) => sum + l.actionClicks, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-gray-600">
            View counts and action clicks for your listings.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {PERIODS.map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p}d
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Web Visits</CardTitle>
            <HiGlobe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {webViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Last {period} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listing Views</CardTitle>
            <HiEye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Last {period} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Clicks</CardTitle>
            <HiCursorClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalActionClicks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Last {period} days</p>
          </CardContent>
        </Card>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No analytics data yet. Data will appear as people visit your
            listings.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Action Clicks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.listingId}>
                  <TableCell className="font-medium">{listing.title}</TableCell>
                  <TableCell className="text-right">
                    {listing.views.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {listing.actionClicks.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
