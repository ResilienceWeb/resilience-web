import type { InstrumentationOnRequestError } from 'next/dist/server/instrumentation/types'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from '@opentelemetry/sdk-logs'
import * as Sentry from '@sentry/nextjs'

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
const isProduction = process.env.NODE_ENV === 'production' && !isBuildPhase

// Fraction of requests traced. Errors are captured whatever this is.
const TRACES_SAMPLE_RATE = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1)

const posthogApiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

export const loggerProvider = new LoggerProvider({
  resource: resourceFromAttributes({ 'service.name': 'resilience-web' }),
  processors:
    isProduction && posthogApiKey
      ? [
          new BatchLogRecordProcessor({
            exporter: new OTLPLogExporter({
              url: `${posthogHost}/i/v1/logs`,
              headers: {
                Authorization: `Bearer ${posthogApiKey}`,
                'Content-Type': 'application/json',
              },
            }),
          }),
        ]
      : [],
})

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

  // Logs go to both while we confirm Sentry receives what PostHog does. Once
  // that is verified, the PostHog half and the whole OTel setup come out.
  Sentry.logger.error(err.message, attributes)

  const logger = loggerProvider.getLogger('resilience-web')
  logger.emit({
    body: err.message,
    severityNumber: SeverityNumber.ERROR,
    severityText: 'ERROR',
    attributes,
  })

  // Netlify freezes the function once the response is out, so both exporters
  // are flushed before returning rather than left to their batch timers.
  await Promise.all([loggerProvider.forceFlush(), Sentry.flush(2000)])
}

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: 'https://a205584b48c84a7fbfcd3632479d33f7@o4505069644611584.ingest.sentry.io/4505069646643200',
      enabled: isProduction,
      tracesSampleRate: TRACES_SAMPLE_RATE,
      enableLogs: true,
      debug: false,
    })

    logs.setGlobalLoggerProvider(loggerProvider)
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: 'https://a205584b48c84a7fbfcd3632479d33f7@o4505069644611584.ingest.sentry.io/4505069646643200',
      enabled: isProduction,
      tracesSampleRate: TRACES_SAMPLE_RATE,
      enableLogs: true,
      debug: false,
    })
  }
}
