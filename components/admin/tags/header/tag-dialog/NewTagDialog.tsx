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
  onSubmit: (id: any) => void
  isOpen: boolean
  onClose: () => void
}

const NewTagDialog: React.FC<props> = ({ onSubmit, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new tag</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Use this form to create a new tag. This can easily be changed later.
        </DialogDescription>
        <TagForm onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  )
}

export default memo(NewTagDialog)
