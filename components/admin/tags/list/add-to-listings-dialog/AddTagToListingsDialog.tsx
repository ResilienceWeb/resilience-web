import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Checkbox } from '@components/ui/checkbox'
import type { CheckedState } from '@radix-ui/react-checkbox'

export default function AddTagToListingsDialog({
  tag,
  listings,
  onClose,
  onSubmit,
}) {
  const linkedListingsIds = useMemo(() => {
    return tag.listings.map((listing) => listing.id)
  }, [tag.listings])

  const [selectedListings, setSelectedListings] = useState(
    new Set(linkedListingsIds),
  )

  const handleCheckboxChange = (listingId: number, checked: CheckedState) => {
    const newSelected = new Set(selectedListings)
    if (checked) {
      newSelected.add(listingId)
    } else {
      newSelected.delete(listingId)
    }
    setSelectedListings(newSelected)
  }

  const handleSubmit = () => {
    const addedListingIds = Array.from(selectedListings).map(Number)
    const removedListingIds = linkedListingsIds.filter(
      (id) => !addedListingIds.includes(id),
    )
    onSubmit(addedListingIds, removedListingIds)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add tag to listings</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Add the tag to the selected listings
        </DialogDescription>
        <div className="flex flex-col gap-4">
          {listings.map((listing) => (
            <div key={listing.id} className="flex items-center">
              <Checkbox
                id={`listing-${listing.id}`}
                checked={selectedListings.has(listing.id)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(listing.id, checked)
                }
              />
              <label
                htmlFor={`listing-${listing.id}`}
                className="ml-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {listing.title}
              </label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
