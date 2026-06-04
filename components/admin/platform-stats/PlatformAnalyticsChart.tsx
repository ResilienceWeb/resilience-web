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
import usePlatformAnalytics from '@hooks/admin-stats/usePlatformAnalytics'

const PERIODS = [
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
  { value: 365, label: '1y' },
] as const

const chartConfig = {
  webVisits: { label: 'Web Visits', color: '#2563eb' },
  listingViews: { label: 'Listing Views', color: '#16a34a' },
  actionClicks: { label: 'Action Clicks', color: '#d97706' },
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

export default function PlatformAnalyticsChart() {
  const [period, setPeriod] = useState<number>(90)
  const { analytics, isPending } = usePlatformAnalytics({ period })

  const daily: DailyPoint[] = analytics ?? []

  const totals = [
    {
      key: 'webVisits',
      label: 'Web Visits',
      value: daily.reduce((sum, d) => sum + d.webVisits, 0),
    },
    {
      key: 'listingViews',
      label: 'Listing Views',
      value: daily.reduce((sum, d) => sum + d.listingViews, 0),
    },
    {
      key: 'actionClicks',
      label: 'Action Clicks',
      value: daily.reduce((sum, d) => sum + d.actionClicks, 0),
    },
  ] as const

  const hasData = totals.some((t) => t.value > 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-row items-start justify-between gap-4">
          <CardTitle className="text-sm font-medium">
            Combined analytics · last{' '}
            {period === 365 ? '12 months' : `${period} days`}
          </CardTitle>
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {PERIODS.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2">
          {totals.map((t) => (
            <div key={t.key} className="flex flex-col">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
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
        {isPending ? (
          <div className="flex h-70 items-center justify-center">
            <Spinner />
          </div>
        ) : hasData ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-70 w-full"
          >
            <AreaChart data={daily} margin={{ left: 4, right: 12, top: 8 }}>
              <defs>
                {totals.map((t) => (
                  <linearGradient
                    key={t.key}
                    id={`platform-fill-${t.key}`}
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
                  fill={`url(#platform-fill-${t.key})`}
                  stroke={chartConfig[t.key].color}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="text-muted-foreground py-16 text-center text-sm">
            No analytics data yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
