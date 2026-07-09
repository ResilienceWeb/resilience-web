export const CATEGORY_COLOR_MAPPING = {
  'England: The North': '#cb6ce6',
  'England: Midlands': '#c6079c',
  'England: South West': '#d0d07b',
  'Wales & Borders': '#ff5757',
  Scotland: '#005EB8',
  'England: London & SE': '#2cb868',
  'United Kingdom': '#737373',
}

// The API's `countries` field is a pipe-separated list that usually includes
// 'United Kingdom' alongside the actual region, and occasionally stray
// countries (e.g. 'Anguilla') or multiple regions. Pick the first known
// region, falling back to 'United Kingdom' when there is none.
export function getRegionFromCountries(countries: string): string {
  const regions = countries
    .replace(/&amp;/g, '&')
    .split('|')
    .map((entry) => entry.trim())
    .filter(
      (entry) => entry !== 'United Kingdom' && entry in CATEGORY_COLOR_MAPPING,
    )

  return regions[0] ?? 'United Kingdom'
}

export const TAG_COLOR_MAPPING = {
  'Transition Group': '#737373',
  'Community Growing': '#2cb868',
  'Other food projects': '#ff5757',
  Nature: '#09622f',
  'Community hub or activities': '#d0d07b',
  'Festivals, fairs or events': '#005EB8',
  'Art / creativity': '#c6079c',
  'Community visioning / imagination work': '#cb6ce6',
  'Building local networks': '#ff5757',
  'Local economy or new economy projects': '#2cb868',
  'Wellbeing or Inner Transition': '#c77dbd',
  'Social Justice / Just Transition activities': '#fc0f03',
  'Youth or education projects': '#02b3c7',
  'Share, Repair or reuse': '#4d23cc',
  Energy: '#c7c702',
  Transport: '#968a95',
  Other: '#ebe6ea',
}
