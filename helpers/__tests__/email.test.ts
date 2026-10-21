import { createElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendEmail } from '../email'

const resendSend = vi.fn().mockResolvedValue({ data: { id: '1' }, error: null })
const sendMail = vi.fn().mockResolvedValue({})

vi.mock('../resend', () => ({
  getResend: () => ({ emails: { send: resendSend } }),
}))
vi.mock('nodemailer', () => ({ createTransport: () => ({ sendMail }) }))

const automatedHeaders = {
  'Auto-Submitted': 'auto-generated',
  'X-Auto-Response-Suppress': 'All',
}

const send = () =>
  sendEmail({
    to: 'hello@example.org',
    subject: 'A listing was created',
    email: createElement('p', null, 'Hello'),
  })

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('sendEmail', () => {
  it('marks email sent through Resend as auto-generated', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    await send()

    expect(resendSend).toHaveBeenCalledWith(
      expect.objectContaining({ headers: automatedHeaders }),
    )
  })

  it('marks email sent to the local mail server as auto-generated', async () => {
    vi.stubEnv('NODE_ENV', 'development')

    await send()

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ headers: automatedHeaders }),
    )
  })
})
