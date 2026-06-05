const MAILERLITE_BASE = 'https://connect.mailerlite.com/api'

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
  }
}

type SubscriberFields = Record<string, string | number | null>

/**
 * Create or update a subscriber. MailerLite's POST /subscribers endpoint
 * upserts by email, so this works for both new and existing subscribers.
 * Returns the subscriber id, or null if the request failed.
 */
export async function upsertSubscriber({
  email,
  fields,
  groups,
}: {
  email: string
  fields?: SubscriberFields
  groups?: string[]
}): Promise<string | null> {
  const response = await fetch(`${MAILERLITE_BASE}/subscribers`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      email,
      ...(fields ? { fields } : {}),
      ...(groups && groups.length ? { groups } : {}),
    }),
  })
  const data = await response.json()

  if (!response.ok || data.error || !data.data?.id) {
    throw new Error(
      `MailerLite upsertSubscriber failed for ${email}: ${
        data.error ? JSON.stringify(data.error) : response.status
      }`,
    )
  }

  return data.data.id as string
}

type Subscriber = {
  id: string
  status: string
}

/**
 * Look up a subscriber by email. Returns the subscriber (id + status) if they
 * already exist in MailerLite, or null if they don't.
 */
export async function getSubscriber(email: string): Promise<Subscriber | null> {
  const response = await fetch(
    `${MAILERLITE_BASE}/subscribers/${encodeURIComponent(email)}`,
    { headers: authHeaders() },
  )

  if (response.status === 404) {
    return null
  }

  const data = await response.json()
  if (!data.data?.id) {
    return null
  }

  return { id: data.data.id, status: data.data.status }
}

/**
 * Look up a subscriber's id by email, or null if they aren't a subscriber.
 */
export async function getSubscriberId(email: string): Promise<string | null> {
  const subscriber = await getSubscriber(email)
  return subscriber?.id ?? null
}

/**
 * Permanently delete ("forget") a subscriber, removing them from MailerLite.
 */
export async function forgetSubscriber(subscriberId: string): Promise<void> {
  const response = await fetch(
    `${MAILERLITE_BASE}/subscribers/${subscriberId}/forget`,
    {
      method: 'POST',
      headers: authHeaders(),
    },
  )
  const data = await response.json()

  if (!response.ok || data.error) {
    throw new Error(
      `MailerLite forgetSubscriber failed for ${subscriberId}: ${
        data.error ? JSON.stringify(data.error) : response.status
      }`,
    )
  }
}

// Resolve group names to ids once per runtime, then cache.
const groupIdCache = new Map<string, string>()

/**
 * Resolve a MailerLite group id by name, creating the group if it doesn't
 * exist yet. Results are cached for the lifetime of the process.
 */
export async function getOrCreateGroupId(name: string): Promise<string> {
  const cached = groupIdCache.get(name)
  if (cached) {
    return cached
  }

  const lookup = await fetch(
    `${MAILERLITE_BASE}/groups?filter[name]=${encodeURIComponent(name)}`,
    { headers: authHeaders() },
  )
  const lookupJson = await lookup.json()
  const existing = lookupJson.data?.find(
    (group: { id: string; name: string }) => group.name === name,
  )
  if (existing?.id) {
    groupIdCache.set(name, existing.id)
    return existing.id
  }

  const created = await fetch(`${MAILERLITE_BASE}/groups`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  })
  const createdJson = await created.json()
  if (!created.ok || !createdJson.data?.id) {
    throw new Error(`MailerLite getOrCreateGroupId failed for "${name}"`)
  }

  groupIdCache.set(name, createdJson.data.id)
  return createdJson.data.id as string
}

/**
 * Remove a subscriber from a group. A no-op if they weren't a member.
 */
export async function unassignFromGroup(subscriberId: string, groupId: string) {
  await fetch(
    `${MAILERLITE_BASE}/subscribers/${subscriberId}/groups/${groupId}`,
    {
      method: 'DELETE',
      headers: authHeaders(),
    },
  )
}

/**
 * The role-based groups this app manages in MailerLite. Group membership is
 * reconciled against these on every segmentation sync.
 */
export const SEGMENTATION_GROUPS = {
  owner: 'Web Owners',
  editor: 'Web Editors',
} as const
