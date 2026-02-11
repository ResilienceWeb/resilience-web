import { SeverityNumber } from '@opentelemetry/api-logs'
import { loggerProvider } from '@/instrumentation'

const logger = loggerProvider.getLogger('resilience-web')

const severityMap = {
  debug: SeverityNumber.DEBUG,
  info: SeverityNumber.INFO,
  warn: SeverityNumber.WARN,
  error: SeverityNumber.ERROR,
} as const

export function log(
  level: keyof typeof severityMap,
  message: string,
  attributes?: Record<string, string | number | boolean>,
) {
  logger.emit({
    body: message,
    severityNumber: severityMap[level],
    severityText: level.toUpperCase(),
    attributes,
  })
}

export async function flushLogs() {
  await loggerProvider.forceFlush()
}
