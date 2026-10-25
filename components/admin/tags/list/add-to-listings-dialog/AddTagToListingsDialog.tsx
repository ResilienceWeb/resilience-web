import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Checkbox } from '@components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@components/ui/dialog'

export default function AddTagToListingsDialog({
  tag,
  listings,
  onClose,
  onSubmit,
}) {
  // The tag hangs off each listing's placement in this web, which is what the
  // listings come back with as `placements[0]`.
  const choices = listings.flatMap((listing) => {
    const placementId = listing.placements?.[0]?.id
    return placementId === undefined
      ? []
      : [{ placementId, title: listing.title, tags: listing.tags ?? [] }]
  })
  const linkedListingsIds = choices
    .filter((choice) => choice.tags.some((t) => t.id === tag.id))
    .map((choice) => choice.placementId)

  const [selectedListings, setSelectedListings] = useState(
    () => new Set(linkedListingsIds),
  )

  const handleCheckboxChange = (
    listingId: number,
    checked: boolean | 'indeterminate',
  ) => {
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
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add tag to listings</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Add the tag to the selected listings
        </DialogDescription>
        <div className="flex flex-col gap-4 overflow-y-auto py-4 pr-2">
          {choices.map((choice) => (
            <div key={choice.placementId} className="flex items-center">
              <Checkbox
                id={`listing-${choice.placementId}`}
                checked={selectedListings.has(choice.placementId)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(choice.placementId, checked)
                }
              />
              <label
                htmlFor={`listing-${choice.placementId}`}
                className="ml-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {choice.title}
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
