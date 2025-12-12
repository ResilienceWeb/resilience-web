import { memo } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@components/ui/button'
import useDeleteListingEdit from '@hooks/listings/useDeleteListingEdit'
import ActionEdits from './ActionEdits'
import Diff from './Diff'
import SocialMediaEdits from './SocialMediaEdits'

const ListingMap = dynamic(() => import('@components/listing-map'), {
  ssr: false,
  loading: () => <div className="pt-5 text-center">Loading…</div>,
})

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

  const hadNoLocationPreviously = Boolean(!listing.location)
  const editedLocationHasNoPhysicalLocation = Boolean(
    editedListing.location?.noPhysicalLocation,
  )

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

      {/* Display image differences */}
      {!listing.image && editedListing.image && (
        <>
          <h3 className="my-2 text-lg font-semibold">Image (new)</h3>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex flex-col items-center">
              <div className="relative h-[200px] w-[300px] overflow-hidden rounded-md border">
                <Image
                  src={editedListing.image}
                  alt="New listing image"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {listing.image && editedListing.image && (
        <div>
          <h3 className="my-2 text-lg font-semibold">Image</h3>
          <div className="flex flex-col gap-4 md:flex-row">
            {listing.image && (
              <div className="flex flex-col items-center">
                <div className="relative h-[200px] w-[300px] overflow-hidden rounded-md border">
                  <Image
                    src={listing.image}
                    alt="Current listing image"
                    fill
                    className="object-contain"
                  />
                </div>
                {(!editedListing.image ||
                  listing.image !== editedListing.image) && (
                  <span
                    className="mt-2 text-red-600 italic"
                    style={{
                      textDecoration: !editedListing.image
                        ? 'line-through'
                        : 'none',
                    }}
                  >
                    {!editedListing.image ? 'Image removed' : 'Current image'}
                  </span>
                )}
              </div>
            )}

            {editedListing.image && listing.image !== editedListing.image && (
              <div className="flex flex-col items-center">
                <div className="relative h-[200px] w-[300px] overflow-hidden rounded-md border">
                  <Image
                    src={editedListing.image}
                    alt="New listing image"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="mt-2 text-green-600 italic">
                  {!listing.image ? 'New image added' : 'New image'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <SocialMediaEdits listing={listing} editedListing={editedListing} />

      <ActionEdits listing={listing} editedListing={editedListing} />

      {listing.location?.description !==
        editedListing.location?.description && (
        <div className="flex flex-col gap-2">
          <h3 className="mt-2 text-lg font-semibold">
            Location {hadNoLocationPreviously ? '(new)' : '(changed)'}
          </h3>
          <p className="bg-[#fec4c0] w-fit text-[red]">
            {listing.location?.description}
          </p>

          {!hadNoLocationPreviously &&
            listing.location?.latitude &&
            listing.location?.longitude && (
              <ListingMap
                latitude={listing.location.latitude}
                longitude={listing.location.longitude}
                locationDescription={listing.location?.description}
                hideDescription
              />
            )}

          <p className="bg-[#b5efdb] w-fit text-[green]">
            {editedListing.location?.description}
            {editedLocationHasNoPhysicalLocation && ' (no physical location)'}
          </p>
          {!editedLocationHasNoPhysicalLocation &&
            editedListing.location?.latitude &&
            editedListing.location?.longitude && (
              <ListingMap
                latitude={editedListing.location.latitude}
                longitude={editedListing.location.longitude}
                locationDescription={editedListing.location?.description}
                hideDescription
              />
            )}
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
