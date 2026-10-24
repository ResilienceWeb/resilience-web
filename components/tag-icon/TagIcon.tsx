import { getIcon } from '@helpers/icons'

/** A tag's icon, in the colour of its label, sized to sit before it in a chip. */
export default function TagIcon({ name }: { name?: string | null }) {
  const icon = getIcon(name)
  if (!icon) return null
  return (
    <icon.monochrome
      className="mr-0.5 h-[1.25em] w-[1.25em] shrink-0"
      aria-hidden="true"
    />
  )
}
