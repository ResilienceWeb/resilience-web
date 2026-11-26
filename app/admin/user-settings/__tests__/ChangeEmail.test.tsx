import { recordRequests } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { renderPage } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import ChangeEmail from '../ChangeEmail.tsx'

const CURRENT = 'sam@example.com'
const NEW = 'sam@new.example.com'
const REQUEST_CHANGE = '*/api/auth/email-otp/request-email-change'
const CHANGE = '*/api/auth/email-otp/change-email'
// Changing the address refreshes the signed-in session.
const GET_SESSION = '*/api/auth/get-session'

async function requestCodeFor(email: string) {
  const view = renderPage(<ChangeEmail currentEmail={CURRENT} />)
  const { user } = view
  await user.click(screen.getByRole('button', { name: 'Change email' }))
  await user.type(screen.getByLabelText('New email address'), email)
  await user.click(screen.getByRole('button', { name: 'Send code' }))
  return view
}

describe('changing the account email address', () => {
  it('sends a code to the new address and switches to it once confirmed', async () => {
    const requested = recordRequests({ success: true })
    const changed = recordRequests({ success: true })
    server.use(
      http.post(REQUEST_CHANGE, requested.resolver),
      http.post(CHANGE, changed.resolver),
      http.get(GET_SESSION, () => HttpResponse.json(null)),
    )

    const { user } = await requestCodeFor('  Sam@New.Example.com ')

    expect(
      await screen.findByText(new RegExp(`sent a 6-digit code to ${NEW}`)),
    ).toBeInTheDocument()
    expect(requested.calls[0]?.body).toEqual({ newEmail: NEW })

    await user.type(screen.getByLabelText('Verification code'), '123456')

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(changed.calls[0]?.body).toEqual({ newEmail: NEW, otp: '123456' })
  })

  it('keeps the dialog open and explains when the code is wrong', async () => {
    server.use(
      http.post(REQUEST_CHANGE, () => HttpResponse.json({ success: true })),
      http.post(CHANGE, () =>
        HttpResponse.json(
          { code: 'INVALID_OTP', message: 'Invalid OTP' },
          { status: 400 },
        ),
      ),
    )
    const { user } = await requestCodeFor(NEW)

    await user.type(await screen.findByLabelText('Verification code'), '000000')

    expect(
      await screen.findByText('Invalid code. Please check and try again.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('explains when another account already has the address', async () => {
    server.use(
      http.post(REQUEST_CHANGE, () => HttpResponse.json({ success: true })),
      http.post(CHANGE, () =>
        HttpResponse.json({ message: 'Email already in use' }, { status: 400 }),
      ),
    )
    const { user } = await requestCodeFor(NEW)

    await user.type(await screen.findByLabelText('Verification code'), '123456')

    expect(
      await screen.findByText(
        /Another account already uses this email address/,
      ),
    ).toBeInTheDocument()
  })

  it('does not send a code to the address already in use on the account', async () => {
    // No request is stubbed, so sending one would fail the test.
    await requestCodeFor(CURRENT)

    expect(
      screen.getByText('This is already your email address.'),
    ).toBeInTheDocument()
  })
})
