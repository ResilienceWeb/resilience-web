import type { InstrumentationOnRequestError } from 'next/dist/server/instrumentation/types'
import * as Sentry from '@sentry/nextjs'
import { DATA_COLLECTION } from '@helpers/sentry'

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
const isProduction = process.env.NODE_ENV === 'production' && !isBuildPhase

// Fraction of requests traced. Errors are captured whatever this is.
const TRACES_SAMPLE_RATE = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1)

export async function onRequestError(
  ...args: Parameters<InstrumentationOnRequestError>
) {
  const [error, request, context] = args

  Sentry.captureRequestError(error, request, context)

  const err = error instanceof Error ? error : new Error(String(error))
  const attributes = {
    'error.type': err.name,
    'error.stack': err.stack || '',
    'http.method': request.method,
    'http.path': request.path,
    'next.route.path': context.routePath,
    'next.route.type': context.routeType,
    'next.router.kind': context.routerKind,
  }

  Sentry.logger.error(err.message, attributes)

  // Netlify freezes the function once the response is out, so buffered logs
  // are flushed before returning rather than left to the batch timer.
  await Sentry.flush(2000)
}

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: 'https://a205584b48c84a7fbfcd3632479d33f7@o4505069644611584.ingest.sentry.io/4505069646643200',
      enabled: isProduction,
      tracesSampleRate: TRACES_SAMPLE_RATE,
      dataCollection: DATA_COLLECTION,
      debug: false,
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: 'https://a205584b48c84a7fbfcd3632479d33f7@o4505069644611584.ingest.sentry.io/4505069646643200',
      enabled: isProduction,
      tracesSampleRate: TRACES_SAMPLE_RATE,
      dataCollection: DATA_COLLECTION,
      debug: false,
    })
  }
}
