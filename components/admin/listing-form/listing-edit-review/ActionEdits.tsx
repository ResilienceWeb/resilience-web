import { memo } from 'react'

interface Props {
  listing: Listing
  editedListing: Listing
}

const ActionEdits = ({ listing, editedListing }: Props) => {
  if (!listing.actions?.length && !editedListing.actions?.length) {
    return null
  }

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-4">
        {/* Get all unique action types from both listings */}
        {[
          ...new Set([
            ...(listing.actions?.map((a) => a.type) || []),
            ...(editedListing.actions?.map((a) => a.type) || []),
          ]),
        ].map((type) => {
          const oldAction = listing.actions?.find((a) => a.type === type)
          const newAction = editedListing.actions?.find((a) => a.type === type)

          // Action exists in both, but URLs differ (modified)
          if (oldAction && newAction && oldAction.url !== newAction.url) {
            return (
              <div key={type} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="first-letter:capitalize">{type}:</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          color: 'red',
                          backgroundColor: '#fec4c0',
                          textDecoration: 'line-through',
                        }}
                      >
                        {oldAction.url}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          color: 'green',
                          backgroundColor: '#b5efdb',
                        }}
                      >
                        {newAction.url}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          // Action only in current listing (removed)
          if (oldAction && !newAction) {
            return (
              <div key={type} className="flex items-center gap-2">
                <span className="first-letter:capitalize">{type}:</span>
                <span
                  style={{
                    color: 'red',
                    backgroundColor: '#fec4c0',
                    textDecoration: 'line-through',
                  }}
                >
                  {oldAction.url}
                </span>
                <span className="text-gray-600 italic">(removed)</span>
              </div>
            )
          }

          // Action only in edited listing (added)
          if (!oldAction && newAction) {
            return (
              <div key={type} className="flex items-center gap-2">
                <span className="first-letter:capitalize">{type}:</span>
                <span style={{ color: 'green', backgroundColor: '#b5efdb' }}>
                  {newAction.url}
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

export default memo(ActionEdits)
