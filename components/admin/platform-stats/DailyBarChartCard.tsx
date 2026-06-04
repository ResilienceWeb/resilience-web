'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@components/ui/chart'
import { Spinner } from '@components/ui/spinner'

const PERIODS = [
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
  { value: 365, label: '1y' },
] as const

type DailyPoint = {
  date: string
  count: number
}

function formatDay(value: string) {
  const date = new Date(`${value}T00:00:00Z`)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

type DailyBarChartCardProps = {
  title: string
  seriesLabel: string
  color: string
  data?: DailyPoint[]
  isPending: boolean
  period: number
  onPeriodChange: (period: number) => void
  emptyMessage: string
}

export default function DailyBarChartCard({
  title,
  seriesLabel,
  color,
  data,
  isPending,
  period,
  onPeriodChange,
  emptyMessage,
}: DailyBarChartCardProps) {
  const points: DailyPoint[] = data ?? []
  const total = points.reduce((sum, d) => sum + d.count, 0)
  const hasData = points.some((d) => d.count > 0)

  const chartConfig = {
    count: { label: seriesLabel, color },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-sm font-medium">
            {title} · last {period === 365 ? '12 months' : `${period} days`}
          </CardTitle>
          <span className="text-2xl font-bold">{total.toLocaleString()}</span>
        </div>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPeriodChange(p.value)}
            >
              {p.label}
            </Button>
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
            <BarChart data={points} margin={{ left: 4, right: 12, top: 8 }}>
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
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="text-muted-foreground py-16 text-center text-sm">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
