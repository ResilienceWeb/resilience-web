'use client'

import { useState } from 'react'
import useListingsCreated from '@hooks/admin-stats/useListingsCreated'
import DailyBarChartCard from './DailyBarChartCard'

export default function ListingsCreatedChart() {
  const [period, setPeriod] = useState<number>(90)
  const { listingsCreated, isPending } = useListingsCreated({ period })

  return (
    <DailyBarChartCard
      title="Listings created"
      seriesLabel="Listings created"
      color="#0ea5e9"
      data={listingsCreated}
      isPending={isPending}
      period={period}
      onPeriodChange={setPeriod}
      emptyMessage="No listings created in this period yet."
    />
  )
}
