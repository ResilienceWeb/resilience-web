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

