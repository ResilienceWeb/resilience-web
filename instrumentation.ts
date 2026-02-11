import { logs } from '@opentelemetry/api-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from '@opentelemetry/sdk-logs'
import * as Sentry from '@sentry/nextjs'

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
const isProduction = process.env.NODE_ENV === 'production' && !isBuildPhase

const posthogApiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

export const loggerProvider = new LoggerProvider({
  resource: resourceFromAttributes({ 'service.name': 'resilience-web' }),
  processors:
    isProduction && posthogApiKey
      ? [
          new BatchLogRecordProcessor(
            new OTLPLogExporter({
              url: `${posthogHost}/i/v1/logs`,
              headers: {
                Authorization: `Bearer ${posthogApiKey}`,
                'Content-Type': 'application/json',
              },
            }),
          ),
        ]
      : [],
})

export const onRequestError = Sentry.captureRequestError

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: 'https://a205584b48c84a7fbfcd3632479d33f7@o4505069644611584.ingest.sentry.io/4505069646643200',
      enabled: isProduction,
      tracesSampleRate: 1,
      debug: false,
    })

    logs.setGlobalLoggerProvider(loggerProvider)
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: 'https://a205584b48c84a7fbfcd3632479d33f7@o4505069644611584.ingest.sentry.io/4505069646643200',
      enabled: isProduction,
      tracesSampleRate: 1,
      debug: false,
    })
  }
}
