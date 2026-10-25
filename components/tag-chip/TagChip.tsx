import TagLabel from '@components/tag-label'
import { Badge } from '@components/ui/badge'

/** A tag as it appears on a listing page. */
export default function TagChip({
  tag,
}: {
  tag: { label: string; icon?: string | null; color?: string | null }
}) {
  return (
    <Badge
      className="cursor-pointer px-2.5 py-0.5 text-xs font-medium tracking-wide transition-all select-none hover:opacity-90"
      style={{ backgroundColor: tag.color ?? '#718096' }}
    >
      <TagLabel tag={tag} />
    </Badge>
  )
}
