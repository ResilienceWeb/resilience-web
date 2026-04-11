'use client'

import AnalyticsSummary from '@components/admin/analytics-summary/AnalyticsSummary'
import { useAppContext } from '@store/hooks'

export default function AnalyticsPage() {
  const { selectedWebSlug } = useAppContext()

  return <AnalyticsSummary webSlug={selectedWebSlug} />
}
