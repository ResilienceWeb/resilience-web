type Rgb = [number, number, number]

// Category colours are stored without a '#' and passed around with one, so
// both are accepted.
function parseHex(hex: string): Rgb | null {
  const digits = (hex ?? '').replace(/^#/, '')
  const full =
    digits.length === 3
      ? [...digits].map((digit) => digit + digit).join('')
      : digits
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(full)) {
    return null
  }
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb
}

/** The colour as a CSS `rgba()` value, or unchanged if it isn't a hex colour. */
export function withAlpha(hex: string, alpha: number): string {
  const rgb = parseHex(hex)
  return rgb ? `rgba(${rgb.join(', ')}, ${alpha})` : hex
}

// WCAG 2 relative luminance.
function luminance([r, g, b]: Rgb): number {
  const [R, G, B] = [r, g, b].map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

export function contrastRatio(hex1: string, hex2: string): number | null {
  const rgb1 = parseHex(hex1)
  const rgb2 = parseHex(hex2)
  if (!rgb1 || !rgb2) {
    return null
  }
  const [lighter, darker] = [luminance(rgb1), luminance(rgb2)].sort(
    (a, b) => b - a,
  )
  return (lighter + 0.05) / (darker + 0.05)
}

export const selectMoreAccessibleColor = (
  backgroundColorHex: string,
  color1Hex: string,
  color2Hex: string,
) => {
  const contrast1 = contrastRatio(backgroundColorHex, color1Hex) ?? 0
  const contrast2 = contrastRatio(backgroundColorHex, color2Hex) ?? 0

  return contrast1 > contrast2 ? color1Hex : color2Hex
}

export function hasAlpha(imgEl) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext && canvas.getContext('2d')

  if (!context) {
    return false
  }

  const height = (canvas.height =
    imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height)
  const width = (canvas.width =
    imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width)

  context.drawImage(imgEl, 0, 0)

  try {
    const data = context.getImageData(0, 0, width, height).data
    let hasAlphaPixels = false
    for (let i = 3, n = data.length; i < n; i += 4) {
      if (data[i] < 255) {
        hasAlphaPixels = true
        break
      }
    }
    return hasAlphaPixels
  } catch {
    // Canvas is tainted by cross-origin image data - cannot read pixels
    return false
  }
}
