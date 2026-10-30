import { memo } from 'react'
import { toast } from 'sonner'
import TagChip from '@components/tag-chip'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@components/ui/dialog'
import { Separator } from '@components/ui/separator'
import useAddSharedTagToWeb from '@hooks/tags/useAddSharedTagToWeb'
import useSharedTags from '@hooks/tags/useSharedTags'
import TagForm from './tag-form'

type props = {
  onSubmit: (id: any) => void
  isOpen: boolean
  onClose: () => void
}

const NewTagDialog: React.FC<props> = ({ onSubmit, isOpen, onClose }) => {
  const { sharedTags, isPending, isError } = useSharedTags()
  const { mutate: addSharedTag, isPending: isAdding } = useAddSharedTagToWeb()
  const notYetAdded = sharedTags?.filter((tag) => !tag.added) ?? []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add tag</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Add a shared tag, which means the same thing in every web, or create
          your own.
        </DialogDescription>

        <section aria-labelledby="shared-tags-heading">
          <h3 id="shared-tags-heading" className="mb-3 text-base font-semibold">
            Shared tags
          </h3>
          {isError ? (
            <p role="alert" className="text-sm text-red-600">
              We couldn&apos;t load the shared tags. Please try again later.
            </p>
          ) : isPending ? null : notYetAdded.length === 0 ? (
            <p className="text-sm text-gray-600">
              Your web has added every shared tag.
            </p>
          ) : (
            <ul className="grid max-h-60 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {notYetAdded.map((tag) => (
                <li
                  key={tag.id}
                  className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5"
                >
                  <TagChip tag={tag} />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isAdding}
                    aria-label={`Add ${tag.label}`}
                    onClick={() =>
                      addSharedTag(
                        { tagId: tag.id },
                        { onError: (error) => toast.error(error.message) },
                      )
                    }
                  >
                    Add
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Separator />

        <section aria-labelledby="own-tag-heading">
          <h3 id="own-tag-heading" className="text-base font-semibold">
            Or create your own
          </h3>
          <p className="mb-3 text-sm text-gray-600">
            A tag that only your web uses.
          </p>
          <TagForm onSubmit={onSubmit} />
        </section>
      </DialogContent>
    </Dialog>
  )
}

export default memo(NewTagDialog)
