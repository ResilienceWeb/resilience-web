export const encodeUriElements = (elements: string[]): string => {
  const commaSeparated = elements.join(',')
  const uriEncoded = encodeURIComponent(commaSeparated)
  return uriEncoded
}

export const decodeUriElements = (uriEncodedString: string): string[] => {
  const uriDecodedString = decodeURIComponent(uriEncodedString)
  const uriDecoded = uriDecodedString.split(',')
  return uriDecoded
}

