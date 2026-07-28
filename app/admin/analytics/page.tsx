'use client'

import AnalyticsSummary from '@components/admin/analytics-summary/AnalyticsSummary'
import Faq from '@components/faq'
import { useAppContext } from '@store/hooks'

const faqs = [
  {
    question: 'What do the numbers mean?',
    answer:
      'Web visits count visits to your main web page, listing views count visits to individual listing pages, and action clicks count presses on the action buttons on your listings, such as Volunteer or Donate.',
  },
  {
    question: 'Can I see data from further back?',
    answer:
      'You can currently view the last 7, 30 or 90 days. If you need something more specific, get in touch at info@resilienceweb.org.uk.',
  },
]

export default function AnalyticsPage() {
  const { selectedWebSlug } = useAppContext()

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsSummary webSlug={selectedWebSlug} />

      <div className="mb-8">
        <h3 className="mb-4 text-2xl font-bold">FAQs</h3>
        <Faq content={faqs} />
      </div>
    </div>
  )
}
