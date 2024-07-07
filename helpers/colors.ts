/* eslint-disable prefer-const */
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

/**
 * Function to get the background color from an image.
 * Its just one of the various approaches to get the result.
 * Works for most of the cases and should be fast.
 * It is advised to perform this kind of computation from a worker.
 *
 * @param imgEl [object HTMLImageElement]
 *              The image object for which background is needed.
 * @param aDoc [object HTMLDocument]
 *             The document object.
 * @return [String] The color in rgb(rrr,ggg,bbb) format
 */
export function getBackgroundColor(imgEl, aDoc) {
  function getMatchingGroupIndex(r, g, b) {
    const rgb = [r, g, b]
    if (avg.length == 0) {
      avg[0] = rgb
      count[0] = 1
      return
    } else {
      for (let i = 0; i < avg.length; i++) {
        const [aR, aG, aB] = avg[i]
        if (
          Math.abs(aR - r) < 15 &&
          Math.abs(aG - g) < 15 &&
          Math.abs(aB - b) < 15
        ) {
          avg[i] = avg[i].map(function (x, ii) {
            return (x * count[i] + rgb[ii]) / (count[i] + 1)
          })
          count[i]++
          return
        }
      }
      // no match, creating a new group
      count[avg.length] = 1
      avg[avg.length] = rgb
      return
    }
  }

  let canvas = aDoc.createElement('canvas'),
    context = canvas.getContext('2d'),
    x,
    y,
    width,
    height,
    ratio,
    ti,
    count = [],
    avg = []

  ratio = Math.max(
    Math.ceil((imgEl.naturalHeight + 1) / 256),
    Math.ceil((imgEl.naturalWidth + 1) / 256),
  )
  width = canvas.width = imgEl.naturalWidth / ratio
  height = canvas.height = imgEl.naturalHeight / ratio
  canvas.style.imageRendering = '-moz-crisp-edges'
  context.scale(1 / ratio, 1 / ratio)
  context.drawImage(imgEl, 0, 0)

  if (width === 0 || height === 0) {
    return null
  }

  const { data } = context.getImageData(0, 0, width, height)
  for (x = 0; x < width; x += 2) {
    for (y = 0; y < height; y += 2) {
      ti = 4 * y * width + 4 * x
      getMatchingGroupIndex(data[ti], data[ti + 1], data[ti + 2])
    }
  }
  const maxIndex = count.indexOf(Math.max.apply(this, count))
  avg[maxIndex] = avg[maxIndex].map((x) => Math.ceil(x))
  return 'rgb(' + avg[maxIndex].join(',') + ')'
}
