import { logger, schedules } from '@trigger.dev/sdk'
import { deleteOldAnalytics } from '@db/analyticsRepository'

const cleanupAnalyticsTask = schedules.task({
  id: 'cleanup-analytics',
  run: async () => {
    logger.log('Running analytics cleanup - deleting records older than 1 year')

    const result = await deleteOldAnalytics(365)

    logger.log('Analytics cleanup complete', { result })

    return result
  },
})

export default cleanupAnalyticsTask
