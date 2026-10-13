import { server } from '@/test/msw/server'
import { renderPage } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import VerifyOTP from '../page.tsx'

const EMAIL = 'sam@example.com'
const SEND_OTP = '*/api/auth/email-otp/send-verification-otp'

describe('resending the sign-in code', () => {
  beforeEach(() => {
    // The sign-in page leaves the address here before sending the visitor on.
    sessionStorage.setItem('otp-email', EMAIL)
  })

  it('confirms the code was sent and stops a second resend', async () => {
    server.use(http.post(SEND_OTP, () => HttpResponse.json({ success: true })))
    const { user } = renderPage(<VerifyOTP />)

    await user.click(screen.getByRole('button', { name: 'Resend code' }))

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        `We've sent a new code to ${EMAIL}.`,
      ),
    )
    expect(screen.getByRole('button', { name: 'Code sent' })).toBeDisabled()
  })

  it('lets the visitor try again when the code could not be sent', async () => {
    server.use(
      http.post(SEND_OTP, () =>
        HttpResponse.json({ message: 'Mail server down' }, { status: 500 }),
      ),
    )
    const { user } = renderPage(<VerifyOTP />)

    await user.click(screen.getByRole('button', { name: 'Resend code' }))

    expect(
      await screen.findByText('Unable to send code. Please try again.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByRole('button', { name: 'Resend code' })).toBeEnabled()
  })
})
