import { getIcon } from '@helpers/icons'
import TagIcon from '@components/tag-icon'

/** What a tag chip says: the tag's icon if it has one, otherwise a '#'. */
export default function TagLabel({
  tag,
}: {
  tag: { label: string; icon?: string | null }
}) {
  return (
    <>
      {getIcon(tag.icon) ? <TagIcon name={tag.icon} /> : '#'}
      {tag.label}
    </>
  )
}
