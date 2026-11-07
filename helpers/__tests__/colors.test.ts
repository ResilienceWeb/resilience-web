import { describe, expect, test } from 'vitest'
import {
  contrastRatio,
  selectMoreAccessibleColor,
  withAlpha,
} from '@helpers/colors'

describe('contrastRatio', () => {
  test('black on white is the maximum, 21', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21)
  })

  test('a colour against itself is 1', () => {
    expect(contrastRatio('7ed957', '#7ed957')).toBeCloseTo(1)
  })

  test('matches the WCAG figure for mid-grey on white', () => {
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
  })

  test('is null for something that is not a hex colour', () => {
    expect(contrastRatio('#undefined', '#fff')).toBeNull()
  })
})

describe('selectMoreAccessibleColor', () => {
  test.each([
    ['ffde59', '#3f3f40'],
    ['7ed957', '#3f3f40'],
    ['#1e3a8a', '#fff'],
    ['8c52ff', '#fff'],
  ])('picks %s text on %s', (background, expected) => {
    expect(selectMoreAccessibleColor(background, '#3f3f40', '#fff')).toBe(
      expected,
    )
  })

  test('does not throw on a colour it cannot read', () => {
    expect(() =>
      selectMoreAccessibleColor('#undefined', '#3f3f40', '#fff'),
    ).not.toThrow()
  })
})

describe('withAlpha', () => {
  test('accepts the colour with or without a #', () => {
    expect(withAlpha('7ed957', 0.5)).toBe('rgba(126, 217, 87, 0.5)')
    expect(withAlpha('#7ed957', 0.5)).toBe('rgba(126, 217, 87, 0.5)')
  })

  test('expands shorthand hex', () => {
    expect(withAlpha('#f0a', 1)).toBe('rgba(255, 0, 170, 1)')
  })

  test('leaves anything else alone', () => {
    expect(withAlpha('red', 0.5)).toBe('red')
  })
})
