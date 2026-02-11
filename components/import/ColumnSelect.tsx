'use client'

/**
 * Dropdown for selecting listing field for a CSV column
 */
import { useState } from 'react'
import type { ListingField } from '@/lib/import/types'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@components/lib/utils'
import { Button } from '@components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'

const FIELD_LABELS: Record<ListingField, string> = {
  name: 'Name (required)',
  description: 'Description',
  email: 'Email',
  website: 'Website',
  address: 'Address',
  category: 'Category',
  facebook: 'Facebook',
  twitter: 'Twitter/X',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
}

interface ColumnSelectProps {
  value: ListingField
  onChange: (value: ListingField) => void
  availableFields: ListingField[]
  disabled?: boolean
}

export function ColumnSelect({
  value,
  onChange,
  availableFields,
  disabled = false,
}: ColumnSelectProps) {
  const [open, setOpen] = useState(false)

  // Include current value in options even if not in availableFields
  const allOptions =
    value && !availableFields.includes(value)
      ? [value, ...availableFields]
      : availableFields

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value === null
            ? "(Don't import)"
            : value
              ? FIELD_LABELS[value]
              : 'Select field...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-62.5 p-0">
        <Command>
          <CommandInput placeholder="Search fields..." />
          <CommandList>
            <CommandEmpty>No field found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="none"
                onSelect={() => {
                  onChange(null)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === null ? 'opacity-100' : 'opacity-0',
                  )}
                />
                (Don't import)
              </CommandItem>
              {allOptions.map((field) => (
                <CommandItem
                  key={field}
                  value={field}
                  onSelect={() => {
                    onChange(field)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === field ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {FIELD_LABELS[field]}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
