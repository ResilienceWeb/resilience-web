import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderIconSvg } from '../icon-render'
import { getIcon, iconSets, isSelectableIcon } from '../icons'

describe('looking up an icon', () => {
  it('finds a Font Awesome icon by its bare stored name, or namespaced', () => {
    expect(getIcon('Leaf')?.set).toBe('fa')
    expect(getIcon('fa:Leaf')).toBe(getIcon('Leaf'))
  })

  it('finds a Green Map icon by its namespaced name', () => {
    expect(getIcon('gm:food-bank')).toMatchObject({
      label: 'Food Bank',
      set: 'gm',
      src: '/icons/green-map/food-bank.svg',
    })
  })

  it('finds nothing for an unknown name', () => {
    expect(getIcon('gm:Leaf')).toBeUndefined()
    expect(getIcon('food-bank')).toBeUndefined()
    expect(getIcon(null)).toBeUndefined()
  })
})

describe('which icons can be saved', () => {
  it('allows any icon from either set but not the map-marker fallback', () => {
    expect(isSelectableIcon('Leaf')).toBe(true)
    expect(isSelectableIcon('gm:food-bank')).toBe(true)
    expect(isSelectableIcon('default')).toBe(false)
    expect(isSelectableIcon('gm:nope')).toBe(false)
    expect(isSelectableIcon(42)).toBe(false)
  })
})

describe('the Green Map set', () => {
  const greenMap = iconSets.find((set) => set.id === 'gm')

  it('has every icon Green Map publishes, each with its file committed', () => {
    expect(greenMap.icons).toHaveLength(169)
    for (const icon of greenMap.icons) {
      expect(existsSync(path.join('public', icon.src)), icon.src).toBe(true)
    }
  })

  it('renders in its own colours, whatever colour is asked for', () => {
    const svg = renderIconSvg('gm:food-bank', '#fff', 16)

    expect(svg).toContain('href="/icons/green-map/food-bank.svg"')
    expect(svg).not.toContain('#fff')
  })
})

describe('a Green Map icon in one colour', () => {
  it('takes the colour asked for', () => {
    const svg = renderToStaticMarkup(
      createElement(getIcon('gm:food-bank').monochrome, { color: '#123456' }),
    )

    expect(svg).toContain('fill="#123456"')
    expect(svg).toContain('href="/icons/green-map/food-bank.svg"')
  })

  it('uses a cut-out version for the icons that use white, which would mask as solid', () => {
    const maskOf = (name: string) =>
      renderToStaticMarkup(createElement(getIcon(name).monochrome)).match(
        /href="([^"]+)"/,
      )?.[1]

    expect(maskOf('gm:green-store')).toBe(
      '/icons/green-map/mono/green-store.svg',
    )
    expect(maskOf('gm:pollution-monitor')).toBe(
      '/icons/green-map/mono/pollution-monitor.svg',
    )
    expect(maskOf('gm:future-redevelopment-space')).toBe(
      '/icons/green-map/mono/future-redevelopment-space.png',
    )
    for (const icon of iconSets.find((set) => set.id === 'gm').icons) {
      const mask = maskOf(icon.name)
      expect(existsSync(path.join('public', mask)), mask).toBe(true)
    }
  })
})

describe('Font Awesome icons', () => {
  it('still render as inline SVG in the colour asked for', () => {
    expect(renderIconSvg('Leaf', '#123456', 16)).toMatch(
      /^<svg[^>]*(fill|color)="#123456"/,
    )
  })
})
