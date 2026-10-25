/**
 * Tags as the client sees them. A tag with no web is a shared tag, common to
 * every web (see docs/adr/0001-shared-tags-are-one-row-across-webs.md).
 */
type TagLike = {
  webId?: number | null
  retiredAt?: string | Date | null
  _count?: { listings: number }
}

// Kept free of imports so scripts run by plain `node` can use it.

export const isSharedTag = (tag: TagLike) => tag.webId == null

/** Whether a tag may be added to a listing: retired shared tags may not. */
export const isPickableTag = (tag: TagLike) => !tag.retiredAt

/**
 * Whether a tag belongs on a web's admin tag list: all of its own tags, and
 * only the shared tags its listings use.
 */
export const isInWebTagList = (tag: TagLike) =>
  !isSharedTag(tag) || (tag._count?.listings ?? 0) > 0

/** Labels that differ only by case or surrounding space name the same tag. */
export const sameTagLabel = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase()
