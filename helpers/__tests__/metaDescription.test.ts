import { describe, expect, it } from 'vitest'
import { metaDescription } from '../metaDescription'

describe('metaDescription', () => {
  it('strips HTML and keeps a short description whole', () => {
    expect(metaDescription('<p>We fix <b>bikes</b>.</p>')).toBe('We fix bikes.')
  })

  it('is empty when there is no description', () => {
    expect(metaDescription(null)).toBe('')
    expect(metaDescription(undefined)).toBe('')
  })

  it('ends a long description at the last clause break before 160 characters', () => {
    const description = `We grow food, ${'and share it with neighbours '.repeat(4)}, ${'x'.repeat(100)}`

    const result = metaDescription(description)

    expect(result).toBe(
      `We grow food, ${'and share it with neighbours '.repeat(4)}...`,
    )
    expect(result.length).toBeLessThanOrEqual(160)
  })

  it('cuts at 157 characters when there is no clause break', () => {
    expect(metaDescription('x'.repeat(200))).toBe(`${'x'.repeat(157)}...`)
  })
})
