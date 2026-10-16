import sanitizeHtml from 'sanitize-html'
import { EMBED_PROVIDERS } from './embed-providers.js'

// The allow-list is derived from what is actually stored — every tag, attribute
// and style property below appears in the existing 1,578 listing and 50 web
// descriptions — rather than from the library's defaults, so sanitising an old
// row on its next save does not silently strip formatting someone relied on.
//
// Deliberately absent: script, object, embed, and form with its controls.
// Nothing in the corpus uses them, and a form inside a listing description is
// a phishing surface rather than a formatting choice. iframes are allowed only
// for the media providers in embed-providers.js; an arbitrary one could put a
// fake sign-in page inside the site.

function embedUrl(src: string | undefined): URL | null {
  if (!src) return null
  let url: URL
  try {
    // TinyMCE writes protocol-relative embed URLs.
    url = new URL(src, 'https://invalid.example')
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  url.protocol = 'https:'
  // No cookies until the visitor presses play.
  if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
    url.hostname = 'www.youtube-nocookie.com'
  }
  const allowed = EMBED_PROVIDERS.some(
    ({ hostname, pathPrefix }) =>
      url.hostname === hostname && url.pathname.startsWith(pathPrefix),
  )
  return allowed ? url : null
}

const options: sanitizeHtml.IOptions = {
  allowedTags: [
    'a',
    'article',
    'b',
    'blockquote',
    'br',
    'caption',
    'code',
    'dd',
    'div',
    'dl',
    'dt',
    'em',
    'figcaption',
    'figure',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hr',
    'i',
    'iframe',
    'img',
    'li',
    'ol',
    'p',
    'picture',
    'pre',
    'section',
    'source',
    'span',
    'strong',
    'sub',
    'sup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'u',
    'ul',
    'wbr',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    source: ['src', 'srcset', 'sizes', 'media', 'type'],
    iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen'],
    '*': ['class', 'style'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^(left|right|center|justify)$/],
      'text-decoration': [/^(underline|line-through|none)$/],
      'font-weight': [/^(bold|normal|[1-9]00)$/],
      'font-style': [/^(italic|normal)$/],
    },
  },
  // javascript: and every other scheme is dropped. `data:` survives on images
  // alone, because a handful of listings inline their images that way.
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'], iframe: ['https'] },
  transformTags: {
    iframe: (tagName, attribs) => {
      const url = embedUrl(attribs.src)
      if (!url) return { tagName, attribs: {} }
      return { tagName, attribs: { ...attribs, src: url.toString() } }
    },
    // A link opening in a new tab hands the opener to the target page unless
    // this is set; TinyMCE does not add it.
    a: (tagName, attribs) => ({
      tagName,
      attribs:
        attribs.target === '_blank'
          ? { ...attribs, rel: 'noopener noreferrer' }
          : attribs,
    }),
  },
  // A rejected embed has had its src cleared above; drop the empty frame.
  exclusiveFilter: (frame) => frame.tag === 'iframe' && !frame.attribs.src,
}

/**
 * Strips scripts, event handlers and unsafe URLs from rich text before it is
 * stored. Non-string input (a missing form field, null) passes through
 * untouched so call sites keep their existing null handling.
 */
export function sanitizeRichText<T>(value: T): T {
  return typeof value === 'string' ? (sanitizeHtml(value, options) as T) : value
}
