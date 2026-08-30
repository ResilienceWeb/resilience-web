import { createUser } from '@/test/factories'
import { request } from '@/test/http'
import { describe, expect, it } from 'vitest'
import { POST as contact } from '../../../contact/route.ts'
import { POST as checkEmail } from '../route.ts'

/**
 * Netlify sets this header itself, so it is what the limiter keys on. Each test
 * uses its own address, since the rate_limits rows are truncated between tests
 * but the bucket is shared across every caller within one.
 */
const from = (ip: string) => ({ 'x-nf-client-connection-ip': ip })

const check = (email: string, ip: string) =>
  checkEmail(
    request('/api/users/check-email', {
      method: 'POST',
      body: { email },
      headers: from(ip),
    }),
  )

describe('rate limiting on the open endpoints', () => {
  describe('POST /api/users/check-email', () => {
    it('answers the first ten attempts, then refuses', async () => {
      await createUser({ email: 'known@example.org' })

      for (let attempt = 1; attempt <= 10; attempt++) {
        const response = await check('known@example.org', '198.51.100.1')
        expect(response.status, `attempt ${attempt}`).toBe(200)
      }

      const blocked = await check('known@example.org', '198.51.100.1')
      expect(blocked.status).toBe(429)
      expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0)
    })

    it('still answers a different caller once one is blocked', async () => {
      for (let attempt = 1; attempt <= 11; attempt++) {
        await check('someone@example.org', '198.51.100.2')
      }

      const other = await check('someone@example.org', '203.0.113.9')
      expect(other.status).toBe(200)
    })

    it('does not leak whether an address exists once blocked', async () => {
      await createUser({ email: 'real@example.org' })
      for (let attempt = 1; attempt <= 11; attempt++) {
        await check('real@example.org', '198.51.100.3')
      }

      const blocked = await check('real@example.org', '198.51.100.3')
      const body = await blocked.json()
      expect(blocked.status).toBe(429)
      expect(JSON.stringify(body)).not.toContain('exists')
    })
  })

  describe('POST /api/contact', () => {
    const send = (ip: string) =>
      contact(
        request('/api/contact', {
          method: 'POST',
          body: {
            email: 'sender@example.org',
            web: 'bristol',
            message: 'hello',
            recaptchaToken: 'stubbed',
          },
          headers: from(ip),
        }),
      )

    it('sends the first three messages, then refuses', async () => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        const response = await send('198.51.100.4')
        expect(response.status, `attempt ${attempt}`).toBe(201)
      }

      const blocked = await send('198.51.100.4')
      expect(blocked.status).toBe(429)
    })
  })
})
