import chroma from 'chroma-js'

export const selectMoreAccessibleColor = (
  backgroundColorHex,
  color1Hex,
  color2Hex,
) => {
  const contrast1 = chroma.contrast(
    chroma(backgroundColorHex),
    chroma(color1Hex),
  )
  const contrast2 = chroma.contrast(
    chroma(backgroundColorHex),
    chroma(color2Hex),
  )

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
