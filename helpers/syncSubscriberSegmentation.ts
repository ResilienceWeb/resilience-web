import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import {
  upsertSubscriber,
  getSubscriberId,
  getOrCreateGroupId,
  unassignFromGroup,
  SEGMENTATION_GROUPS,
} from './mailerlite'

type HighestRole = 'admin' | 'owner' | 'editor' | 'subscriber'

/**
 * Recompute a user's role-based segmentation from the database and push it to
 * MailerLite: sets custom fields and reconciles role-based group membership.
 *
 * Call this whenever a user's web access changes (granted, removed, role
 * changed). Safe to call for any email — it no-ops cleanly if the user doesn't
 * exist.
 *
 * This only updates people who are already MailerLite subscribers (i.e. who
 * opted in). If the email isn't an existing subscriber it does nothing — we
 * never add someone to MailerLite off the back of a role change.
 */
export async function syncSubscriberSegmentation(email: string): Promise<void> {
  if (!email) {
    return
  }

  // Only segment people who have already opted in.
  const subscriberId = await getSubscriberId(email)
  if (!subscriberId) {
    return
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      name: true,
      role: true,
      webAccess: {
        where: { web: { deletedAt: null } },
        select: { role: true, web: { select: { title: true } } },
      },
    },
  })

  if (!user) {
    return
  }

  const ownedWebs = user.webAccess
    .filter((access) => access.role === 'OWNER')
    .map((access) => access.web.title)
  const editedWebs = user.webAccess
    .filter((access) => access.role === 'EDITOR')
    .map((access) => access.web.title)

  const isAdmin = user.role === 'admin'
  const isOwner = ownedWebs.length > 0
  const isEditor = editedWebs.length > 0

  const highestRole: HighestRole = isAdmin
    ? 'admin'
    : isOwner
      ? 'owner'
      : isEditor
        ? 'editor'
        : 'subscriber'

  const allWebs = [...new Set([...ownedWebs, ...editedWebs])]

  // Resolve the groups this user should belong to, and the managed groups they
  // should be removed from (e.g. demoted from owner to editor).
  const membership: Record<keyof typeof SEGMENTATION_GROUPS, boolean> = {
    owner: isOwner,
    editor: isEditor,
  }

  const groupEntries = await Promise.all(
    (Object.keys(SEGMENTATION_GROUPS) as Array<keyof typeof SEGMENTATION_GROUPS>).map(
      async (key) => ({
        key,
        id: await getOrCreateGroupId(SEGMENTATION_GROUPS[key]),
        shouldBeMember: membership[key],
      }),
    ),
  )

  const groupsToAdd = groupEntries
    .filter((group) => group.shouldBeMember)
    .map((group) => group.id)

  // Update the existing subscriber's fields and add them to the groups they
  // belong to.
  await upsertSubscriber({
    email,
    fields: {
      name: user.name ?? null,
      highest_role: highestRole,
      webs_owned_count: ownedWebs.length,
      webs_edited_count: editedWebs.length,
      webs: allWebs.join(', '),
    },
    groups: groupsToAdd,
  })

  // Remove them from any managed groups they should no longer be in.
  await Promise.all(
    groupEntries
      .filter((group) => !group.shouldBeMember)
      .map((group) => unassignFromGroup(subscriberId, group.id)),
  )
}

/**
 * Fire-and-forget wrapper: runs the segmentation sync without letting a
 * MailerLite failure break the calling database operation. Errors are reported
 * to Sentry.
 */
export async function syncSubscriberSegmentationSafe(
  email: string,
): Promise<void> {
  try {
    await syncSubscriberSegmentation(email)
  } catch (error) {
    console.error(
      `[RW] Failed to sync MailerLite segmentation for ${email} - ${error}`,
    )
    Sentry.captureException(error, { extra: { email } })
  }
}
