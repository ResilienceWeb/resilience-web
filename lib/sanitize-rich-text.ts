import sanitizeHtml from 'sanitize-html'

// The allow-list is derived from what is actually stored — every tag, attribute
// and style property below appears in the existing 1,578 listing and 50 web
// descriptions — rather than from the library's defaults, so sanitising an old
// row on its next save does not silently strip formatting someone relied on.
//
// Deliberately absent: script, iframe, object, embed, and form with its
// controls. Nothing in the corpus uses them, and a form inside a listing
// description is a phishing surface rather than a formatting choice.
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
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  transformTags: {
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
}

/**
 * Strips scripts, event handlers and unsafe URLs from rich text before it is
 * stored. Non-string input (a missing form field, null) passes through
 * untouched so call sites keep their existing null handling.
 */
export function sanitizeRichText<T>(value: T): T {
  return typeof value === 'string' ? (sanitizeHtml(value, options) as T) : value
}
