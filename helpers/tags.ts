/**
 * Tags as the client sees them. A tag with no web is a shared tag, common to
 * every web (see docs/adr/0001-shared-tags-are-one-row-across-webs.md).
 */
type TagLike = {
  webId?: number | null
  retiredAt?: string | Date | null
}

// Kept free of imports so scripts run by plain `node` can use it.

export const isSharedTag = (tag: TagLike) => tag.webId == null

/** Whether a tag may be added to a listing: retired shared tags may not. */
export const isPickableTag = (tag: TagLike) => !tag.retiredAt

/** Labels that differ only by case or surrounding space name the same tag. */
export const sameTagLabel = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase()
