import { getIcon } from '@helpers/icons'
import { cn } from '@components/lib/utils'

/** A tag's icon, in the colour of its label, sized to sit before it in a chip. */
export default function TagIcon({
  name,
  className,
}: {
  name?: string | null
  className?: string
}) {
  const icon = getIcon(name)
  if (!icon) return null
  return (
    <icon.monochrome
      className={cn('mr-0.5 h-[1.25em] w-[1.25em] shrink-0', className)}
      aria-hidden="true"
    />
  )
}
