import { getIcon } from '@helpers/icons'

/** A tag's icon, sized to sit before its label in a chip. */
export default function TagIcon({ name }: { name?: string | null }) {
  const icon = getIcon(name)
  if (!icon) return null
  return (
    <icon.icon
      className="mr-0.5 h-[1.25em] w-[1.25em] shrink-0"
      aria-hidden="true"
    />
  )
}
