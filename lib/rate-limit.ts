import type { NextRequest } from 'next/server'
import { Prisma } from '@prisma-client'
import prisma from '@prisma-rw'

export type RateLimitResult = {
  ok: boolean
  remaining: number
  retryAfterSeconds: number
}

/**
 * The caller's address. Netlify sets `x-nf-client-connection-ip` itself and it
 * cannot be spoofed by the client; the others are fallbacks for other hosts and
 * for local development, where any of them can be forged. That is acceptable
 * here — this bounds casual abuse, it is not an access control.
 */
export function callerIp(request: NextRequest): string {
  const netlify = request.headers.get('x-nf-client-connection-ip')
  if (netlify) return netlify

  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'

  return request.headers.get('x-real-ip') ?? 'unknown'
}

/**
 * Counts one hit against `bucket:identifier` and reports whether the caller is
 * over `limit` for the current window.
 *
 * The count and the window reset happen in a single statement so that
 * concurrent requests cannot both read a stale count and both be allowed
 * through — the read-modify-write a Prisma upsert would compile to is exactly
 * the race an attacker sending parallel requests would win.
 */
export async function rateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const key = `${bucket}:${identifier}`
  const expiresAt = new Date(Date.now() + windowSeconds * 1000)

  try {
    const rows = await prisma.$queryRaw<{ count: number; expires_at: Date }[]>(
      Prisma.sql`
        INSERT INTO rate_limits ("key", "count", "expires_at")
        VALUES (${key}, 1, ${expiresAt})
        ON CONFLICT ("key") DO UPDATE SET
          "count" = CASE
            WHEN rate_limits."expires_at" < NOW() THEN 1
            ELSE rate_limits."count" + 1
          END,
          "expires_at" = CASE
            WHEN rate_limits."expires_at" < NOW() THEN ${expiresAt}
            ELSE rate_limits."expires_at"
          END
        RETURNING "count", "expires_at"
      `,
    )

    const row = rows[0]
    if (!row) return { ok: true, remaining: limit, retryAfterSeconds: 0 }

    // Keys that are never hit again would otherwise sit here forever. Sweeping
    // on a fraction of requests keeps that bounded without a scheduled job.
    if (Math.random() < 0.01) {
      void prisma.rateLimit
        .deleteMany({ where: { expiresAt: { lt: new Date() } } })
        .catch(() => {})
    }

    return {
      ok: row.count <= limit,
      remaining: Math.max(0, limit - row.count),
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((row.expires_at.getTime() - Date.now()) / 1000),
      ),
    }
  } catch {
    // Fail open. A database blip should not take down the contact form; the
    // alternative is an availability bug wearing a security hat.
    return { ok: true, remaining: limit, retryAfterSeconds: 0 }
  }
}

export function tooManyRequests(result: RateLimitResult, message: string) {
  return Response.json(
    { error: message },
    {
      status: 429,
      headers: { 'Retry-After': String(result.retryAfterSeconds) },
    },
  )
}
