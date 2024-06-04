export const encodeUriElements = (elements: string[]): string => {
  const commaSeparated = elements.join(',')
  return encodeURIComponent(commaSeparated)
}
