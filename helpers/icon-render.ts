import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { getIcon } from '@helpers/icons'

// Intrinsic size for canvas icon images. Rendered large so the rasterized
// SVG stays sharp when the network view is zoomed in.
const CANVAS_ICON_SIZE = 256

/**
 * Render an icon from the catalog to a standalone SVG string, for inlining
 * into HTML (e.g. Leaflet divIcon markup). For canvas, use getIconImage.
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

type CachedIcon = { source: HTMLImageElement; image: CanvasImageSource | null }
const iconImageCache = new Map<string, CachedIcon>()

type IconImageOptions = {
  /**
   * Paint an image-backed icon in `color` too, rather than its own colours,
   * e.g. on a node filled with a colour the icon may share.
   */
  monochrome?: boolean
  onLoad?: () => void
}

// An SVG drawn into an <img> can't be recoloured, and never fetches the
// external image a mask would reference, so tint it on a canvas instead.
function tint(img: HTMLImageElement, color: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_ICON_SIZE
  canvas.height = CANVAS_ICON_SIZE
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, CANVAS_ICON_SIZE, CANVAS_ICON_SIZE)
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, CANVAS_ICON_SIZE, CANVAS_ICON_SIZE)
  return canvas
}

/**
 * Get an icon as an image for canvas rendering, cached per icon and color.
 * Returns null until the image has loaded (SVG data URIs load within a tick,
 * image-backed icons once fetched); pass onLoad to be notified so the canvas
 * can repaint.
 */
export function getIconImage(
  name: string | null | undefined,
  color: string,
  { monochrome = false, onLoad }: IconImageOptions = {},
): CanvasImageSource | null {
  const icon = getIcon(name)
  if (!icon) return null

  const tinted = Boolean(icon.src) && monochrome
  // Image-backed icons keep their own colours, so one image serves every colour
  const key = icon.src && !tinted ? icon.name : `${icon.name}|${color}`
  const cached = iconImageCache.get(key)
  if (cached) {
    if (cached.image) return cached.image
    if (onLoad) cached.source.addEventListener('load', onLoad, { once: true })
    return null
  }

  const source = new Image(CANVAS_ICON_SIZE, CANVAS_ICON_SIZE)
  const entry: CachedIcon = { source, image: null }
  iconImageCache.set(key, entry)
  source.addEventListener('load', () => {
    entry.image = tinted ? tint(source, color) : source
  })
  if (onLoad) source.addEventListener('load', onLoad, { once: true })
  // Load the file itself: an SVG loaded as an image never fetches the
  // external <image> an image-backed icon wraps, so its data URI draws blank.
  source.src = tinted
    ? (icon.monoSrc ?? icon.src)
    : (icon.src ??
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderIconSvg(name, color))}`)
  return null
}
