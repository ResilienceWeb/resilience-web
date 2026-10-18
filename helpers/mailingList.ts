import type { ErrorResponse } from 'resend'
import { getResend } from './resend'

function failure(action: string, email: string, error: ErrorResponse) {
  return new Error(
    `Resend ${action} failed for ${email}: ${error.name} ${error.message}`,
  )
}

function splitName(name?: string | null) {
  const [firstName, ...rest] = (name ?? '').trim().split(/\s+/)
  return {
    firstName: firstName || undefined,
    lastName: rest.length ? rest.join(' ') : undefined,
  }
}

async function findContact(email: string) {
  const { data, error } = await getResend().contacts.get({ email })

  if (error?.name === 'not_found') {
    return null
  }
  if (error) {
    throw failure('get contact', email, error)
  }

  return data
}

/**
 * Add someone to the mailing list, or resubscribe them if they're already a
 * contact. Signing up again is an explicit opt-in, so it overrides an earlier
 * unsubscribe.
 */
export async function subscribe(email: string, name?: string | null) {
  const { firstName, lastName } = splitName(name)
  const existing = await findContact(email)

  const { error } = existing
    ? await getResend().contacts.update({
        email,
        unsubscribed: false,
        ...(firstName ? { firstName, lastName: lastName ?? null } : {}),
      })
    : await getResend().contacts.create({
        email,
        unsubscribed: false,
        firstName,
        lastName,
      })

  if (error) {
    throw failure(existing ? 'update contact' : 'create contact', email, error)
  }
}

export async function isSubscribed(email: string) {
  const contact = await findContact(email)
  return !!contact && !contact.unsubscribed
}

/**
 * Remove someone from the mailing list entirely, rather than flagging them as
 * unsubscribed — opting out in their settings also means forgetting them.
 */
export async function unsubscribe(email: string) {
  if (!(await findContact(email))) {
    return
  }

  const { error } = await getResend().contacts.remove({ email })
  if (error) {
    throw failure('remove contact', email, error)
  }
}
