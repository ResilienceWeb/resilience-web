import * as Sentry from '@sentry/nextjs'
import { sendEmail } from '@helpers/email'
import { isSubscribed, subscribe, unsubscribe } from '@helpers/mailingList'
import EmailChangedEmail from '@components/emails/EmailChangedEmail'

/**
 * Follow-up work once a user's email address has changed. Web access moves on
 * its own (the email foreign keys cascade on update), but the mailing list is
 * keyed by address in Resend, so a subscription has to be moved by hand.
 *
 * The change itself has already happened, so failures here are reported
 * rather than thrown.
 */
export async function onAccountEmailChanged({
  previousEmail,
  newEmail,
  name,
}: {
  previousEmail: string
  newEmail: string
  name?: string | null
}) {
  try {
    if (await isSubscribed(previousEmail)) {
      await subscribe(newEmail, name)
      await unsubscribe(previousEmail)
    }
  } catch (error) {
    Sentry.captureException(error, {
      extra: { context: 'Moving mailing list subscription after email change' },
    })
  }

  try {
    await sendEmail({
      to: previousEmail,
      subject: 'The email address on your Resilience Web account changed',
      email: EmailChangedEmail({ newEmail }),
    })
  } catch (error) {
    Sentry.captureException(error, {
      extra: { context: 'Notifying previous address of email change' },
    })
  }
}
