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
