'use client'

import { useState } from 'react'
import useUserSignups from '@hooks/admin-stats/useUserSignups'
import DailyBarChartCard from './DailyBarChartCard'

export default function UserSignupsChart() {
  const [period, setPeriod] = useState<number>(90)
  const { signups, isPending } = useUserSignups({ period })

  return (
    <DailyBarChartCard
      title="New sign-ups"
      seriesLabel="Sign-ups"
      color="#7c3aed"
      data={signups}
      isPending={isPending}
      period={period}
      onPeriodChange={setPeriod}
      emptyMessage="No sign-ups in this period yet."
    />
  )
}
