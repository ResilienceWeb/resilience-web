import { describe, expect, it } from 'vitest'
import { sanitizeRichText } from '../sanitize-rich-text'

const DANGEROUS =
  /<script|<iframe|<form|<input|<button|<svg|javascript:|\son[a-z]+\s*=|url\(/i

describe('sanitizeRichText', () => {
  describe('strips anything executable', () => {
    it.each([
      ['a script tag', '<p>hi</p><script>fetch("//evil")</script>'],
      [
        'an inline event handler',
        '<img src=x onerror="steal(document.cookie)">',
      ],
      ['an onmouseover handler', '<div onmouseover="alert(1)">hover</div>'],
      ['a javascript: URL', '<a href="javascript:alert(1)">click</a>'],
      ['an iframe', '<iframe src="//evil"></iframe>'],
      ['an svg onload', '<svg onload="alert(1)"></svg>'],
      ['a url() in a style', '<p style="background:url(//evil)">x</p>'],
    ])('removes %s', (_label, input) => {
      expect(sanitizeRichText(input)).not.toMatch(DANGEROUS)
    })

    it('removes a phishing form but keeps its visible text', () => {
      const result = sanitizeRichText(
        '<form action="//evil"><input name="password"><button>Sign in</button></form>',
      )
      expect(result).not.toMatch(DANGEROUS)
      expect(result).toContain('Sign in')
    })
  })

  describe('keeps what editors actually write', () => {
    it.each([
      [
        'formatting',
        '<p><strong>Bold</strong> <em>italic</em> <u>under</u></p>',
      ],
      ['lists', '<ul><li>one</li></ul><ol><li>two</li></ol>'],
      ['headings and quotes', '<h2>Title</h2><blockquote>quote</blockquote>'],
      ['tables', '<table><tbody><tr><td>a</td></tr></tbody></table>'],
      ['alignment', '<p style="text-align:center">centered</p>'],
      ['classes', '<div class="foo"><p class="bar">x</p></div>'],
    ])('preserves %s', (_label, input) => {
      expect(sanitizeRichText(input)).toBe(input)
    })

    it('keeps http, mailto and tel links', () => {
      const input =
        '<a href="https://example.org">web</a><a href="mailto:a@b.org">mail</a><a href="tel:+441234">call</a>'
      expect(sanitizeRichText(input)).toBe(input)
    })

    it('keeps remote and inlined images', () => {
      const remote =
        '<img src="https://cdn.example.org/a.jpg" alt="a" width="200" />'
      const inlined =
        '<img src="data:image/png;base64,iVBORw0KGgo=" alt="logo" />'
      expect(sanitizeRichText(remote)).toBe(remote)
      expect(sanitizeRichText(inlined)).toBe(inlined)
    })
  })

  describe('media embeds', () => {
    it.each([
      [
        'Vimeo',
        '<iframe src="https://player.vimeo.com/video/76979871" width="640" height="360" allowfullscreen></iframe>',
      ],
      [
        'Spotify',
        '<iframe src="https://open.spotify.com/embed/episode/abc" width="100%" height="152" allow="encrypted-media"></iframe>',
      ],
      [
        'SoundCloud',
        '<iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1" width="100%" height="166"></iframe>',
      ],
      [
        'Google Maps',
        '<iframe src="https://www.google.com/maps/embed?pb=!1m18" width="600" height="450"></iframe>',
      ],
      [
        'OpenStreetMap',
        '<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-2.6%2C51.4&amp;layer=mapnik" width="425" height="350"></iframe>',
      ],
    ])('keeps a %s embed', (_label, input) => {
      expect(sanitizeRichText(input)).toBe(input)
    })

    it('serves YouTube from the no-cookie domain, as TinyMCE writes it protocol-relative', () => {
      expect(
        sanitizeRichText(
          '<iframe src="//www.youtube.com/embed/dQw4w9WgXcQ" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>',
        ),
      ).toBe(
        '<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>',
      )
    })

    it.each([
      ['an unknown host', 'https://evil.example/embed/x'],
      ['a lookalike host', 'https://www.youtube.com.evil.example/embed/x'],
      [
        'an allowed host outside its embed path',
        'https://www.google.com/search?q=x',
      ],
      ['a javascript: URL', 'javascript:alert(1)'],
      ['a relative URL', '/admin'],
    ])('drops an iframe pointing at %s', (_label, src) => {
      expect(
        sanitizeRichText(
          `<p>before</p><iframe src="${src}"></iframe><p>after</p>`,
        ),
      ).toBe('<p>before</p><p>after</p>')
    })

    it('strips event handlers from an allowed embed', () => {
      expect(
        sanitizeRichText(
          '<iframe src="https://player.vimeo.com/video/1" onload="steal()" srcdoc="<script>x</script>"></iframe>',
        ),
      ).toBe('<iframe src="https://player.vimeo.com/video/1"></iframe>')
    })
  })

  it('adds rel to links opening in a new tab, which TinyMCE omits', () => {
    expect(
      sanitizeRichText('<a href="https://example.org" target="_blank">x</a>'),
    ).toBe(
      '<a href="https://example.org" target="_blank" rel="noopener noreferrer">x</a>',
    )
  })

  it('passes non-string values through, so callers keep their null handling', () => {
    expect(sanitizeRichText(null)).toBeNull()
    expect(sanitizeRichText(undefined)).toBeUndefined()
  })
})
