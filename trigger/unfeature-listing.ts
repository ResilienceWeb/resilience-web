import { logger, task, wait } from '@trigger.dev/sdk/v3'
import { REMOTE_URL } from '@helpers/config'

export const unfeatureListingTask = task({
  id: 'unfeature-listing',
  run: async (payload: any, { ctx }) => {
    logger.log('Scheduling job to unfeature listing in 7 days', {
      payload,
      ctx,
    })
    const { listingId } = payload

    await wait.for({ minutes: 1 })
    await fetch(`${REMOTE_URL}/api/listing/${listingId}/unfeature`, {
      method: 'PATCH',
    })

    return {
      message: 'Hello, world!',
    }
  },
})
