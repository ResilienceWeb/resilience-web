# Shared tags are one row used by every web

Tags otherwise belong to exactly one web, but a shared tag is a single `Tag` row with no web and a stable `key` (e.g. `food-bank`), linked from listings in any web. We chose this so that a future search across all webs can match on one row, and because webs may not rename or re-icon a shared tag, so there is nothing per-web to store.

## Considered Options

- **A copy per web, linked by a key.** Kept every "a tag belongs to one web" assumption intact, but needed copy-on-first-use logic and left identical rows in every web that invite a "dedupe" that breaks things. Its only real benefit, per-web renaming, is something we ruled out.

## Consequences

- A `null` `webId` on a tag is deliberate: it marks a shared tag, not missing data. Code that lists or counts a web's tags must include the shared tags its listings use.
- Web editors cannot edit or delete a shared tag; the tag routes already refuse tags without a web. Removing a shared tag from a web means removing it from that web's listings.
- Shared tags are retired, never deleted: a retired one leaves the pickers but stays on listings that have it.
