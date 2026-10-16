// @ts-check

// Plain JS so next.config.js can read it too: the sanitizer and the CSP's
// frame-src must allow exactly the same hosts, or embeds that survive saving
// get blocked by the browser.
//
// Matched on path as well as host, so allowing Google Maps does not also let
// any other page on www.google.com be framed inside a listing.
export const EMBED_PROVIDERS = [
  { hostname: 'www.youtube-nocookie.com', pathPrefix: '/embed/' },
  // TinyMCE turns a pasted YouTube link into a youtube.com embed. It is
  // rewritten to youtube-nocookie on save, but the editor previews the
  // original, so the CSP still has to allow it.
  { hostname: 'www.youtube.com', pathPrefix: '/embed/' },
  { hostname: 'player.vimeo.com', pathPrefix: '/video/' },
  { hostname: 'open.spotify.com', pathPrefix: '/embed/' },
  { hostname: 'w.soundcloud.com', pathPrefix: '/player/' },
  { hostname: 'www.google.com', pathPrefix: '/maps/embed' },
  { hostname: 'www.openstreetmap.org', pathPrefix: '/export/embed.html' },
]

export const EMBED_ORIGINS = [
  ...new Set(EMBED_PROVIDERS.map(({ hostname }) => `https://${hostname}`)),
]
