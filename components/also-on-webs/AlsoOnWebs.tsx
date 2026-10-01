import { HiOutlineGlobeAlt } from 'react-icons/hi'
import { getWebUrl } from '@helpers/config'
import { cn } from '@components/lib/utils'

interface Props {
  webs?: AlsoListedIn[]
  className?: string
}

export default function AlsoOnWebs({ webs, className }: Props) {
  if (!webs?.length) {
    return null
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-xs text-gray-600 md:text-sm',
        className,
      )}
    >
      <span className="inline-flex items-center gap-1 font-medium">
        <HiOutlineGlobeAlt className="h-4 w-4" aria-hidden />
        Also on
      </span>
      {webs.map((entry) => (
        <a
          key={entry.web.slug}
          href={`${getWebUrl(entry.web.slug)}/${entry.slug}`}
          className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800 ring-1 ring-sky-100 transition-colors hover:bg-sky-100"
        >
          {entry.web.title}
        </a>
      ))}
    </div>
  )
}
