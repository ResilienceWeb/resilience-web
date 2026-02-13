import { memo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@components/ui/dialog'
import TagForm from './tag-form'

type props = {
  isOpen: boolean
  onSubmit: (id: any) => void
  onClose: () => void
  onDelete: (id: any) => void
  tag: TagWithListings
}

const UpdateTagDialog: React.FC<props> = ({
  isOpen,
  onSubmit,
  onClose,
  onDelete,
  tag,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update tag</DialogTitle>
        </DialogHeader>
        <DialogDescription>Update the selected tag label</DialogDescription>
        <TagForm onSubmit={onSubmit} onDelete={onDelete} tag={tag} />
      </DialogContent>
    </Dialog>
  )
}

export default memo(UpdateTagDialog)
