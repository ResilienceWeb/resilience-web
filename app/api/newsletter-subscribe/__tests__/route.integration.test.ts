import { request } from '@/test/http'
import { describe, expect, it, vi } from 'vitest'
import { subscribe as addToMailingList } from '@helpers/mailingList'
import { POST } from '../route.ts'

const subscribe = (email: string) =>
  POST(
    request('/api/newsletter-subscribe', {
      method: 'POST',
      body: { email, recaptchaToken: 'stubbed' },
      headers: { 'x-nf-client-connection-ip': '198.51.100.20' },
    }),
  )

describe('POST /api/newsletter-subscribe', () => {
  it('adds the address to the mailing list', async () => {
    const response = await subscribe('reader@example.org')

    expect(response.status).toBe(201)
    expect(addToMailingList).toHaveBeenCalledWith('reader@example.org')
  })

  it('does not report success when the mailing list refuses the address', async () => {
    vi.mocked(addToMailingList).mockRejectedValueOnce(
      new Error('Resend create contact failed: restricted_api_key'),
    )

    const response = await subscribe('reader@example.org')
    const body = await response.json()

    expect(response.status).not.toBe(201)
    expect(body.error).toMatch(/couldn't add you to the list/)
  })
})
