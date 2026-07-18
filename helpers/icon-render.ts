import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { getIcon } from '@helpers/icons'

// Intrinsic size for canvas icon images. Rendered large so the rasterized
// SVG stays sharp when the network view is zoomed in.
const CANVAS_ICON_SIZE = 256

/**
 * Render an icon from the catalog to a standalone SVG string, for inlining
 * into HTML (e.g. Leaflet divIcon markup) or loading as an image.
 */
export function renderIconSvg(
  name: string | null | undefined,
  color: string,
  size: number = CANVAS_ICON_SIZE,
): string | null {
  const icon = getIcon(name)
  if (!icon) return null
  return renderToStaticMarkup(createElement(icon.icon, { color, size }))
}

type CachedIcon = { img: HTMLImageElement; loaded: boolean }
const iconImageCache = new Map<string, CachedIcon>()

/**
 * Get an icon as an image for canvas rendering, cached per icon and color.
 * Returns null until the image has loaded (SVG data URIs load within a tick);
 * pass onLoad to be notified so the canvas can repaint.
 */
export function getIconImage(
  name: string | null | undefined,
  color: string,
  onLoad?: () => void,
): HTMLImageElement | null {
  const key = `${name}|${color}`
  const cached = iconImageCache.get(key)
  if (cached) {
    if (cached.loaded) return cached.img
    if (onLoad) cached.img.addEventListener('load', onLoad, { once: true })
    return null
  }

  const svg = renderIconSvg(name, color)
  if (!svg) return null

  const img = new Image(CANVAS_ICON_SIZE, CANVAS_ICON_SIZE)
  const entry: CachedIcon = { img, loaded: false }
  iconImageCache.set(key, entry)
  img.addEventListener('load', () => {
    entry.loaded = true
  })
  if (onLoad) img.addEventListener('load', onLoad, { once: true })
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  return null
}
