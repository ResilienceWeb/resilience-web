import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isSubscribed, subscribe, unsubscribe } from '../mailingList'

/** A stand-in for Resend's contact list, answering in the SDK's `{ data, error }` shape. */
const contacts = new Map<
  string,
  { unsubscribed: boolean; first_name?: string; last_name?: string }
>()
const notFound = {
  data: null,
  error: { name: 'not_found', message: 'Contact not found', statusCode: 404 },
}
let failWith: { name: string; message: string } | null = null

const ok = <T>(data: T) => Promise.resolve({ data, error: null })

const fakeContacts = {
  get: vi.fn(({ email }) =>
    contacts.has(email)
      ? ok({ email, ...contacts.get(email) })
      : Promise.resolve(notFound),
  ),
  create: vi.fn(({ email, unsubscribed, firstName, lastName }) => {
    if (failWith) return Promise.resolve({ data: null, error: failWith })
    contacts.set(email, {
      unsubscribed,
      first_name: firstName,
      last_name: lastName,
    })
    return ok({ id: email })
  }),
  update: vi.fn(({ email, unsubscribed, firstName, lastName }) => {
    contacts.set(email, {
      ...contacts.get(email),
      unsubscribed,
      ...(firstName ? { first_name: firstName, last_name: lastName } : {}),
    })
    return ok({ id: email })
  }),
  remove: vi.fn(({ email }) => {
    contacts.delete(email)
    return ok({ id: email })
  }),
}

vi.mock('../resend', () => ({ getResend: () => ({ contacts: fakeContacts }) }))

beforeEach(() => {
  contacts.clear()
  failWith = null
  vi.clearAllMocks()
})

describe('the mailing list', () => {
  it('adds a new address', async () => {
    await subscribe('reader@example.org')

    expect(await isSubscribed('reader@example.org')).toBe(true)
  })

  it('splits a full name into first and last', async () => {
    await subscribe('ada@example.org', 'Ada King Lovelace')

    expect(contacts.get('ada@example.org')).toMatchObject({
      first_name: 'Ada',
      last_name: 'King Lovelace',
    })
  })

  it('resubscribes someone who had unsubscribed', async () => {
    contacts.set('back@example.org', { unsubscribed: true })

    await subscribe('back@example.org')

    expect(fakeContacts.create).not.toHaveBeenCalled()
    expect(await isSubscribed('back@example.org')).toBe(true)
  })

  it('does not report someone who unsubscribed by email as subscribed', async () => {
    contacts.set('gone@example.org', { unsubscribed: true })

    expect(await isSubscribed('gone@example.org')).toBe(false)
  })

  it('forgets someone who opts out', async () => {
    await subscribe('reader@example.org')

    await unsubscribe('reader@example.org')

    expect(contacts.has('reader@example.org')).toBe(false)
  })

  it('does nothing when someone not on the list opts out', async () => {
    await unsubscribe('stranger@example.org')

    expect(fakeContacts.remove).not.toHaveBeenCalled()
  })

  it('throws when Resend refuses, rather than failing silently', async () => {
    failWith = {
      name: 'restricted_api_key',
      message: 'This API key is restricted to only send emails',
    }

    await expect(subscribe('reader@example.org')).rejects.toThrow(
      /restricted_api_key/,
    )
  })
})
