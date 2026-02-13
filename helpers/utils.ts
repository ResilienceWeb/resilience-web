export const sortStringsFunc = (a, b): number => {
  const labelA = a.label?.toLowerCase()
  const labelB = b.label?.toLowerCase()

  if (labelA < labelB) {
    return -1
  }
  if (labelA > labelB) {
    return 1
  }

  return 0
}

export const stringToBoolean = function (value: string): boolean {
  if (value === 'true') return true

  if (value === 'false') return false

  throw Error(
    'Invalid input. This function only takes "true" or "false" and converts them to primitive boolean.',
  )
}

export const sanitizeLink = (link: string) => {
  if (!link) {
    return ''
  }

  let result = link
  result = result.replace('https://www.', '')
  result = result.replace('https://', '')
  result = result.replace('http://', '')
  result = result.replace(/\/$/, '')

  return result
}

export const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/ /g, '-')
    .replace(/[^a-z0-9-]/gi, '')
    .replace(/--/g, '-')
    .trim()
}

export const removeNonAlphaNumeric = (str: string) => {
  return str.replace(/[^\w\s]/gi, '')
}

export function exclude(data, keys) {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !keys.includes(key)),
  )
}

export function intersection(arrays) {
  return arrays.reduce((a, b) => a.filter((c) => b.includes(c)))
}

export function htmlTitle(html) {
  if (typeof window === 'undefined') {
    return null
  }

  const container = document.createElement('div')
  container.className = 'vis-network-custom-tooltip'
  container.innerHTML = html
  return container
}
