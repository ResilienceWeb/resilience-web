import { logger, task, wait } from '@trigger.dev/sdk'
import { sendMultipleEmails } from '@helpers/email'
import WebInactiveEmail from '@components/emails/WebInactiveEmail'
import { getWebById } from '@db/webRepository'

const checkWebInactiveTask = task({
  id: 'check-web-inactive',
  run: async (payload: any, { ctx }) => {
    logger.log(
      'Scheduling job to check if web is inactive and send email if so',
      {
        payload,
        ctx,
      },
    )
    const { webId } = payload

    await wait.for({ days: 4 })

    const web = await getWebById(webId)
    if (web._count.listings < 3) {
      const emails = web.webAccess.map((w) => w.email)
      const webInactiveEmail = WebInactiveEmail({ webTitle: web.title })

      await sendMultipleEmails({
        toEmails: emails,
        subject: `Need help with ${web.title} Resilience Web?`,
        email: webInactiveEmail,
      })
    }

    return {
      message: 'Hello, world!',
    }
  },
})

export default checkWebInactiveTask
