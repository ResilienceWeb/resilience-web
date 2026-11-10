import { sanitizeRichTextDiff } from '@/lib/sanitize-rich-text'
import htmldiff from 'node-htmldiff'

type Props = {
  label: string
  html1: string | null | undefined
  html2: string | null | undefined
}

export default function HtmlDiff({ label, html1, html2 }: Props) {
  const before = html1 ?? ''
  const after = html2 ?? ''

  if (!before && !after) return null
  if (before === after) return null

  // Edits saved before sanitising was added (#528) are still stored raw.
  const html = sanitizeRichTextDiff(htmldiff(before, after))

  return (
    <div>
      <h3 className="mt-2 text-lg font-semibold">{label}</h3>
      <div
        className="prose prose-sm max-w-none [&_del]:bg-[#fec4c0] [&_del]:text-[red] [&_ins]:bg-[#b5efdb] [&_ins]:text-[green] [&_ins]:no-underline"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {before !== '' && after === '' && (
        <span className="ml-1 inline text-gray-600 italic">(deleted)</span>
      )}
    </div>
  )
}
