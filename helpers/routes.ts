export const encodeUriElements = (elements: string[]): string => {
  const commaSeparated = elements.join(',')
  return encodeURIComponent(commaSeparated)
}

export const decodeUriElements = (uriEncodedString: string): string[] => {
  const uriDecodedString = decodeURIComponent(uriEncodedString)
  return uriDecodedString.split(',')
}

