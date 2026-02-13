import { memo } from 'react'

interface Props {
  listing: Listing
  editedListing: Listing
}

const SocialMediaEdits = ({ listing, editedListing }: Props) => {
  if (!listing.socials?.length && !editedListing.socials?.length) {
    return null
  }

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-4">
        {/* Get all unique platforms from both listings */}
        {[
          ...new Set([
            ...(listing.socials?.map((s) => s.platform) || []),
            ...(editedListing.socials?.map((s) => s.platform) || []),
          ]),
        ].map((platform) => {
          const oldSocial = listing.socials?.find(
            (s) => s.platform === platform,
          )
          const newSocial = editedListing.socials?.find(
            (s) => s.platform === platform,
          )

          // Platform exists in both, but URLs differ (modified)
          if (oldSocial && newSocial && oldSocial.url !== newSocial.url) {
            return (
              <div key={platform} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="first-letter:capitalize">{platform}:</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          color: 'red',
                          backgroundColor: '#fec4c0',
                          textDecoration: 'line-through',
                        }}
                      >
                        {oldSocial.url}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          color: 'green',
                          backgroundColor: '#b5efdb',
                        }}
                      >
                        {newSocial.url}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          // Platform only in current listing (removed)
          if (oldSocial && !newSocial) {
            return (
              <div key={platform} className="flex items-center gap-2">
                <span className="first-letter:capitalize">{platform}:</span>
                <span
                  style={{
                    color: 'red',
                    backgroundColor: '#fec4c0',
                    textDecoration: 'line-through',
                  }}
                >
                  {oldSocial.url}
                </span>
                <span className="text-gray-600 italic">(removed)</span>
              </div>
            )
          }

          // Platform only in edited listing (added)
          if (!oldSocial && newSocial) {
            return (
              <div key={platform} className="flex items-center gap-2">
                <span className="first-letter:capitalize">{platform}:</span>
                <span style={{ color: 'green', backgroundColor: '#b5efdb' }}>
                  {newSocial.url}
                </span>
                <span className="text-gray-600 italic">(added)</span>
              </div>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}

export default memo(SocialMediaEdits)
