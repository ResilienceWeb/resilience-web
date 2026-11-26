import { createUserWithWebAccess, createWeb } from '@/test/factories'
import { WebRole } from '@prisma-client'
import { describe, expect, it, vi } from 'vitest'
import prisma from '@prisma-rw'
import { sendEmail } from '@helpers/email'
import { isSubscribed, subscribe, unsubscribe } from '@helpers/mailingList'
import { getUserAllWebAccess } from '@db/webAccessRepository'
import { onAccountEmailChanged } from '../accountEmailChanged'

const OLD = 'sam@example.com'
const NEW = 'sam@new.example.com'

/** What Better Auth's change-email endpoint does to the user row. */
async function changeEmail(userId: string, email: string) {
  return prisma.user.update({ where: { id: userId }, data: { email } })
}

describe('changing an account email address', () => {
  it('keeps the webs the user can manage', async () => {
    const web = await createWeb({ slug: 'bristol' })
    const { user } = await createUserWithWebAccess(web.id, WebRole.OWNER, {
      email: OLD,
    })

    await changeEmail(user.id, NEW)

    const access = await getUserAllWebAccess(NEW)
    expect(access.map((a) => [a.webId, a.role])).toEqual([
      [web.id, WebRole.OWNER],
    ])
  })

  it('moves a mailing list subscription to the new address', async () => {
    vi.mocked(isSubscribed).mockResolvedValueOnce(true)

    await onAccountEmailChanged({
      previousEmail: OLD,
      newEmail: NEW,
      name: 'Sam Smith',
    })

    expect(subscribe).toHaveBeenCalledWith(NEW, 'Sam Smith')
    expect(unsubscribe).toHaveBeenCalledWith(OLD)
  })

  it('does not subscribe someone who was not on the mailing list', async () => {
    await onAccountEmailChanged({ previousEmail: OLD, newEmail: NEW })

    expect(subscribe).not.toHaveBeenCalled()
  })

  it('tells the previous address about the change', async () => {
    await onAccountEmailChanged({ previousEmail: OLD, newEmail: NEW })

    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: OLD }))
  })

  it('still notifies the previous address if the mailing list is down', async () => {
    vi.mocked(isSubscribed).mockRejectedValueOnce(new Error('Resend down'))

    await onAccountEmailChanged({ previousEmail: OLD, newEmail: NEW })

    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: OLD }))
  })
})
