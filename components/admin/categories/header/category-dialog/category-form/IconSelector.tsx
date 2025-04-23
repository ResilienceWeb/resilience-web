import { useState } from 'react'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog'
import { icons, categories } from '@helpers/icons'

interface IconSelectorProps {
  value: string
  onChange: (value: string) => void
  color: string
}

export default function IconSelector({
  value,
  onChange,
  color,
}: IconSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredIcons = selectedCategory
    ? icons.filter((icon) => icon.category === selectedCategory)
    : icons

  const DisplayIcon =
    value && value !== 'default'
      ? icons.find((icon) => icon.name === value)?.icon
      : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {value && value !== 'default' ? (
          <Button
            variant="outline"
            className="hover:bg-muted/50 flex h-14 w-14 rounded-[50%] p-0 transition-colors"
            style={{ border: `2px solid #${color}` }}
          >
            <div className="flex items-center justify-center">
              <DisplayIcon
                className="!h-8 !w-8"
                style={{ color: `#${color}` }}
              />
            </div>
          </Button>
        ) : (
          <Button variant="outline" className="flex w-fit justify-start">
            <span>Select an icon...</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
        </DialogHeader>
        <DialogDescription>Select an icon for this category</DialogDescription>

        <div className="mb-4 flex flex-wrap gap-1">
          <Button
            key="all"
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-3 overflow-y-auto">
          {filteredIcons.map((iconObj) => {
            const IconComponent = iconObj.icon
            return (
              <Button
                key={iconObj.name}
                variant="outline"
                className="h-16 w-16 p-0"
                onClick={() => {
                  onChange(iconObj.name)
                  setOpen(false)
                }}
              >
                <IconComponent className="!h-8 !w-8" />
              </Button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
