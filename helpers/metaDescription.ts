const MAX_LENGTH = 160
const OMISSION = '...'
const CLAUSE_BREAK = /,.? +/g
const TAG = /<[^>]*>?/gm

function stripTags(html: string): string {
  // TAG swallows every `<`, so one pass is enough; repeating until stable is
  // the form CodeQL's incomplete-sanitization check can verify.
  let text = html
  let previous: string
  do {
    previous = text
    text = text.replace(TAG, '')
  } while (text !== previous)
  return text
}

export function metaDescription(html: string | null | undefined): string {
  const text = stripTags(html ?? '')
  if (text.length <= MAX_LENGTH) {
    return text
  }

  const end = MAX_LENGTH - OMISSION.length
  const cut = text.slice(0, end)
  if (text.slice(end).search(CLAUSE_BREAK) === 0) {
    return cut + OMISSION
  }
  // Prefer ending at a clause break so the snippet doesn't stop mid-phrase.
  const lastBreak = [...cut.matchAll(CLAUSE_BREAK)].at(-1)?.index
  return (lastBreak === undefined ? cut : cut.slice(0, lastBreak)) + OMISSION
}
