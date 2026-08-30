const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY
const MIN_SCORE = 0.5

type SiteVerifyResponse = {
  success?: boolean
  score?: number
  'error-codes'?: string[]
}

/**
 * Verifies a reCAPTCHA v3 token.
 *
 * Google answers a missing, malformed or already-redeemed token with
 * `{ success: false }` and no `score` field at all. A check written as
 * `score < MIN_SCORE` therefore compares `undefined < 0.5`, which is false, and
 * waves through exactly the requests it exists to stop. Success is checked
 * first, and a missing score is treated as a failure rather than a pass.
 */
export async function verifyRecaptcha(token: unknown): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY) {
    // Unconfigured is a pass locally so the forms stay usable without keys, and
    // a failure anywhere else, where it means a broken deployment.
    return process.env.NODE_ENV === 'development'
  }

  if (typeof token !== 'string' || token === '') return false

  try {
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: RECAPTCHA_SECRET_KEY,
          response: token,
        }),
      },
    )

    const result: SiteVerifyResponse = await response.json()

    return result.success === true && typeof result.score === 'number'
      ? result.score >= MIN_SCORE
      : false
  } catch {
    // Google being unreachable should not take the forms down. The rate limit
    // in front of each caller is what bounds the damage in that window.
    return true
  }
}
