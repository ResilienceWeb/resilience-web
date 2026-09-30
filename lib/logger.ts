import * as Sentry from '@sentry/nextjs'

export function log(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  attributes?: Record<string, string | number | boolean>,
) {
  Sentry.logger[level](message, attributes)
}

// Netlify freezes the function once the response is out, so buffered logs are
// flushed explicitly rather than left to Sentry's batch timer.
export async function flushLogs() {
  await Sentry.flush(2000)
}
