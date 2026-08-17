import * as Sentry from '@sentry/nextjs'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { BROWSER_EXTENSION_ERRORS, BROWSER_EXTENSION_URLS } from '../sentry'

describe('Sentry browser-extension filtering', () => {
  let reported: string[] = []

  beforeAll(() => {
    Sentry.init({
      dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
      ignoreErrors: BROWSER_EXTENSION_ERRORS,
      denyUrls: BROWSER_EXTENSION_URLS,
      beforeSend: (event) => {
        const value = event.exception?.values?.[0]?.value
        if (value) reported.push(value)
        return null
      },
    })
  })

  beforeEach(() => {
    reported = []
  })

  const capture = async (error: Error) => {
    Sentry.captureException(error)
    await Sentry.flush(2000)
  }

  it('drops extension messaging errors', async () => {
    await capture(
      new Error('Invalid call to runtime.sendMessage(). Tab not found.'),
    )

    expect(reported).toEqual([])
  })

  it('drops extension content script errors', async () => {
    await capture(
      new TypeError(
        "undefined is not an object (evaluating 'contentScriptData.init_ts')",
      ),
    )

    expect(reported).toEqual([])
  })

  it('drops errors thrown after an extension context is torn down', async () => {
    await capture(new Error('Extension context invalidated.'))

    expect(reported).toEqual([])
  })

  it('still reports application errors', async () => {
    await capture(new Error('Failed to fetch listings for web: 504'))

    expect(reported).toEqual(['Failed to fetch listings for web: 504'])
  })

  it('still reports network and API failures', async () => {
    await capture(new Error('AxiosError: Request failed with status code 403'))

    expect(reported).toEqual([
      'AxiosError: Request failed with status code 403',
    ])
  })
})

describe('BROWSER_EXTENSION_URLS', () => {
  const matches = (url: string) =>
    BROWSER_EXTENSION_URLS.some((it) => it.test(url))

  it('matches scripts served from extension protocols', () => {
    expect(matches('chrome-extension://abcdef/contentScript.js')).toBe(true)
    expect(matches('moz-extension://abcdef/contentScript.js')).toBe(true)
    expect(matches('safari-web-extension://abcdef/contentScript.js')).toBe(true)
  })

  it('leaves our own bundles reportable', () => {
    expect(
      matches('https://resilienceweb.org.uk/_next/static/chunks/main.js'),
    ).toBe(false)
    expect(matches('webkit-masked-url://hidden/')).toBe(false)
  })
})
