import { memo } from 'react'

interface Tag {
  id: number
  label: string
}

interface Props {
  listing: Listing
  editedListing: Listing
}

const TagEdits = ({ listing, editedListing }: Props) => {
  const currentTags: Tag[] = listing.tags ?? []
  const editedTags: Tag[] = editedListing.tags ?? []

  if (!currentTags.length && !editedTags.length) {
    return null
  }

  const editedTagIds = new Set(editedTags.map((t) => t.id))
  const currentTagIds = new Set(currentTags.map((t) => t.id))

  const removedTags = currentTags.filter((t) => !editedTagIds.has(t.id))
  const addedTags = editedTags.filter((t) => !currentTagIds.has(t.id))
  const unchangedTags = currentTags.filter((t) => editedTagIds.has(t.id))

  // Nothing changed — don't render a section.
  if (!removedTags.length && !addedTags.length) {
    return null
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <h3 className="mt-2 text-lg font-semibold">Tags</h3>

      {addedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-green-700">Added:</span>
          {addedTags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full px-3 py-1 text-sm"
              style={{ color: 'green', backgroundColor: '#b5efdb' }}
            >
              + {tag.label}
            </span>
          ))}
        </div>
      )}

      {removedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-red-700">Removed:</span>
          {removedTags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full px-3 py-1 text-sm line-through"
              style={{ color: 'red', backgroundColor: '#fec4c0' }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {unchangedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Unchanged:</span>
          {unchangedTags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(TagEdits)
