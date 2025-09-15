import { useEffect, useState } from 'react'

type ColorMap = { [key: string]: number }
type SortBy = 'vibrance' | 'dominance'
type Format = 'hex' | 'rgb' | 'hsl' | 'hsv' | 'rgba'

interface Color {
  r: number
  g: number
  b: number
  a: number
  count?: number
  saturation?: number
}

interface Options {
  format: Format
  maxSize: number
  colorSimilarityThreshold: number
  sortBy: SortBy
}

interface UseExtractColorReturn {
  dominantColor: string | null
  loading: boolean
  error: Error | null
}

interface ExtractedColors {
  dominantColor: Color | null
}

const defaultOptions: Options = {
  format: 'rgba',
  maxSize: 18,
  colorSimilarityThreshold: 50,
  sortBy: 'dominance',
}

export const useGetDominantColor = (
  imageUrl: string,
  customOptions: Partial<Options> = {},
): UseExtractColorReturn => {
  const options: Options = { ...defaultOptions, ...customOptions }

  const [dominantColor, setDominantColor] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      try {
        if (isMounted) {
          const colors = await extractDominantColors(imageUrl, options)
          const dominantColor = formatToRgba(colors.dominantColor)

          setDominantColor(dominantColor)
        }
      } catch (error) {
        if (isMounted) {
          setError(error as Error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [imageUrl])

  return { dominantColor, loading, error }
}

async function extractDominantColors(
  imageUrl: string,
  options: Options,
): Promise<ExtractedColors> {
  const { maxSize, colorSimilarityThreshold, sortBy } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'

    img.onload = function () {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      const { width, height } = img
      const scaleFactor = Math.min(1, maxSize / Math.max(width, height))

      canvas.width = width * scaleFactor
      canvas.height = height * scaleFactor

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data

      const colorMap: ColorMap = countColors(
        pixels,
        colorSimilarityThreshold,
        sortBy,
      )

      const colors: Color[] = Object.keys(colorMap)
        .map((color) => {
          const [r, g, b, a] = color.split(',').map(Number)
          const hsvToString = formatToHsv({ r, g, b, a })
          const { s, v } = parseHsvString(hsvToString)
          return { r, g, b, a, count: colorMap[color], saturation: s * v }
        })
        .sort((a, b) =>
          sortBy === 'dominance'
            ? b.count - a.count
            : b.saturation - a.saturation,
        )

      let dominantColor: Color | null = null

      if (colors.length > 0) {
        dominantColor = colors[0]
      }

      resolve({
        dominantColor: dominantColor,
      })
    }

    img.onerror = function (error) {
      reject(error as unknown as Error)
    }

    img.src = imageUrl
  })
}

const formatToHsv = (rgba: Color | null): string => {
  if (!rgba) return 'hsv(0,0%,0%)'

  const r = rgba.r / 255
  const g = rgba.g / 255
  const b = rgba.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min

  let h: number, s: number
  const v = max

  if (max !== 0) {
    s = d / max
  } else {
    s = 0
    h = 0
    return `hsv(${h}, ${s}%, ${v * 100}%)`
  }

  if (max === min) {
    h = 0
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
      default:
        h = 0
    }

    h /= 6
  }

  return `hsv(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`
}

const formatToRgba = (color: Color | null): string => {
  if (!color) return 'rgba(0,0,0,0)'
  const { r, g, b, a } = color
  return `rgba(${r},${g},${b},${a})`
}

const colorDistance = (
  color1: [number, number, number, number],
  color2: [number, number, number, number],
): number => {
  const [r1, g1, b1] = color1
  const [r2, g2, b2] = color2
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

const parseHsvString = (
  hsvString: string,
): { h: number; s: number; v: number } => {
  const hsvRegex = /hsv\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/
  const match = hsvString.match(hsvRegex)

  if (!match) {
    throw new Error('Invalid HSV string format')
  }

  const h = parseInt(match[1], 10) / 360
  const s = parseInt(match[2], 10) / 100
  const v = parseInt(match[3], 10) / 100

  return { h, s, v }
}

function countColors(
  pixels: Uint8ClampedArray,
  colorSimilarityThreshold: number,
  sortBy: 'vibrance' | 'dominance',
): ColorMap {
  const colorMap: ColorMap = {}
  const uniqueColors: { [key: string]: [number, number, number, number] } = {}

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const a = pixels[i + 3]

    if (a >= 125) {
      const newColor: [number, number, number, number] = [r, g, b, a]
      let foundSimilar = false

      for (const key in uniqueColors) {
        const existingColor = uniqueColors[key]
        if (colorDistance(newColor, existingColor) < colorSimilarityThreshold) {
          if (sortBy === 'dominance') {
            colorMap[key]++
          }
          foundSimilar = true
          break
        }
      }

      if (!foundSimilar) {
        const colorKey = `${r},${g},${b},${a}`
        uniqueColors[colorKey] = newColor
        colorMap[colorKey] = 1
      }
    }
  }

  return colorMap
}
