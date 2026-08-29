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
