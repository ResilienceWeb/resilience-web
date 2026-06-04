'use client'

import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@components/ui/chart'
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

const chartConfig = {
  webVisits: {
    label: 'Web Visits',
    color: '#2563eb',
  },
  listingViews: {
    label: 'Listing Views',
    color: '#16a34a',
  },
  actionClicks: {
    label: 'Action Clicks',
    color: '#d97706',
  },
} satisfies ChartConfig

type DailyPoint = {
  date: string
  webVisits: number
  listingViews: number
  actionClicks: number
}

function formatDay(value: string) {
  const date = new Date(`${value}T00:00:00Z`)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

type AnalyticsSummaryProps = {
  webSlug: string
  compact?: boolean
}

export default function AnalyticsSummary({
  webSlug,
  compact = false,
}: AnalyticsSummaryProps) {
  const [period, setPeriod] = useState<number>(30)
  const { analytics, isPending } = useAnalytics({ webSlug, period })

  if (isPending) {
    return <Spinner />
  }

  const listings = analytics?.listings ?? []
  const daily: DailyPoint[] = analytics?.daily ?? []

  const webVisits = analytics?.web?.view ?? 0
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0)
  const totalActionClicks = listings.reduce((sum, l) => sum + l.actionClicks, 0)

  const hasData =
    daily.length > 0 &&
    daily.some(
      (d) => d.webVisits > 0 || d.listingViews > 0 || d.actionClicks > 0,
    )

  const totals = [
    { key: 'webVisits', label: 'Web Visits', value: webVisits },
    { key: 'listingViews', label: 'Listing Views', value: totalViews },
    { key: 'actionClicks', label: 'Action Clicks', value: totalActionClicks },
  ] as const

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        {!compact && (
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-gray-600">
              Visits and action clicks for your listings, broken down by day.
            </p>
          </div>
        )}
        <div
          className={`flex gap-1 rounded-lg bg-gray-100 p-1 ${compact ? 'ml-auto' : ''}`}
        >
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Daily activity · last {period} days
          </CardTitle>
          <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2">
            {totals.map((t) => (
              <div key={t.key} className="flex flex-col">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    className="h-2 w-2 rounded-[2px]"
                    style={{ backgroundColor: chartConfig[t.key].color }}
                  />
                  {t.label}
                </span>
                <span className="text-2xl font-bold">
                  {t.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-70 w-full"
            >
              <AreaChart data={daily} margin={{ left: 4, right: 12, top: 8 }}>
                <defs>
                  {totals.map((t) => (
                    <linearGradient
                      key={t.key}
                      id={`fill-${t.key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={chartConfig[t.key].color}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartConfig[t.key].color}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={formatDay}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => formatDay(value as string)}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                {totals.map((t) => (
                  <Area
                    key={t.key}
                    dataKey={t.key}
                    type="linear"
                    fill={`url(#fill-${t.key})`}
                    stroke={chartConfig[t.key].color}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No analytics data yet. Data will appear as people visit your web
              and listings.
            </div>
          )}
        </CardContent>
      </Card>

      {listings.length > 0 && (
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
