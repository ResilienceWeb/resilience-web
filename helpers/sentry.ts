import type { BrowserOptions } from '@sentry/nextjs'

export const BROWSER_EXTENSION_ERRORS = [
  /Invalid call to runtime\.sendMessage\(\)/i,
  /Extension context invalidated/i,
  /contentScriptData/,
]

// webkit-masked-url:// is deliberately not denied — Safari also masks
// first-party bundle URLs, so denying it would swallow real errors.
export const BROWSER_EXTENSION_URLS = [
  /^chrome-extension:\/\//,
  /^chrome-untrusted:\/\//,
  /^moz-extension:\/\//,
  /^safari-extension:\/\//,
  /^safari-web-extension:\/\//,
]

// v11 collects cookies, headers, bodies and IPs unless told otherwise. That
// would ship Better Auth session cookies and sign-in emails to Sentry, so this
// keeps the v10 `sendDefaultPii: false` behaviour, per Sentry's migration guide.
const SENSITIVE_KEYS = { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] }

export const DATA_COLLECTION: BrowserOptions['dataCollection'] = {
  userInfo: false,
  cookies: false,
  httpHeaders: { request: SENSITIVE_KEYS, response: SENSITIVE_KEYS },
  httpBodies: [],
  urlQueryParams: SENSITIVE_KEYS,
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  graphQL: { document: false, variables: false },
  stackFrameVariables: false,
}
