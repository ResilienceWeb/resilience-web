'use client'

import { isWebActive } from '@helpers/webActivity'
import UserSignupsChart from '@components/admin/platform-stats/UserSignupsChart'
import { Spinner } from '@components/ui/spinner'
import useAdminStats from '@hooks/useAdminStats'
import useWebs from '@hooks/webs/useWebs'

export default function StatsPage() {
  const { isPending: isLoadingWebs, webs } = useWebs({ withAdminInfo: true })
  const { stats: adminStats } = useAdminStats()

  if (isLoadingWebs) {
    return <Spinner />
  }

  const totalWebs = webs.length
  const publishedWebs = webs.filter((web) => web.published).length
  const inactiveWebs = webs.filter((web) => !isWebActive(web)).length

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Platform stats</h1>
        <p className="text-muted-foreground">
          An overview of webs and listing activity across the platform.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
        <div className="bg-card rounded-lg border p-4">
          <div className="text-muted-foreground text-sm font-medium">
            Listing Edits (accepted / proposed)
          </div>
          <div className="mt-2 text-2xl font-bold">
            {adminStats?.listingEdits
              ? `${adminStats.listingEdits.accepted}/${adminStats.listingEdits.proposed}`
              : '-'}
          </div>
        </div>
      </div>

      <UserSignupsChart />
    </div>
  )
}
