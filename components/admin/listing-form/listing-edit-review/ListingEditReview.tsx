import { memo } from 'react'
import { Button } from '@components/ui/button'
import Diff from './Diff'
import useDeleteListingEdit from '@hooks/listings/useDeleteListingEdit'
import { useRouter } from 'next/navigation'

interface Props {
  listing: Listing
  editedListing: Listing
  handleSubmit: (data: any) => void
  webSlug: string
}

const ListingEditReview = ({
  listing,
  editedListing,
  handleSubmit,
  webSlug,
}: Props) => {
  const router = useRouter()
  const { deleteListingEdit } = useDeleteListingEdit()

  const handleReject = () => {
    deleteListingEdit({
      listingSlug: listing.slug,
      webSlug,
    })
    router.back()
  }

  return (
    <div className="space-y-6">
      <Diff
        label="Title"
        string1={listing.title}
        string2={editedListing.title}
      />

      <Diff
        label="Category"
        string1={listing.category.label}
        string2={editedListing.category.label}
      />

      <Diff
        label="Description"
        string1={listing.description}
        string2={editedListing.description}
      />

      <Diff
        label="Contact email for organisation"
        string1={listing.email}
        string2={editedListing.email}
      />

      <Diff
        label="Website"
        string1={listing.website}
        string2={editedListing.website}
      />

      {/* Display social media differences */}
      {(listing.socials?.length > 0 || editedListing.socials?.length > 0) && (
        <div>
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
                      <span className="font-medium first-letter:capitalize">
                        {platform}:
                      </span>
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
                    <span className="font-medium first-letter:capitalize">
                      {platform}:
                    </span>
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
                    <span className="font-medium first-letter:capitalize">
                      {platform}:
                    </span>
                    <span
                      style={{ color: 'green', backgroundColor: '#b5efdb' }}
                    >
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
      )}

      <div className="mt-8 flex justify-end gap-4">
        <Button variant="destructive" onClick={handleReject}>
          Reject
        </Button>
        <Button variant="default" onClick={handleSubmit}>
          Accept changes
        </Button>
      </div>
    </div>
  )
}

export default memo(ListingEditReview)
