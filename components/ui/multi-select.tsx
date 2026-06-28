'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import chroma from 'chroma-js'
import { cn } from '@components/lib/utils'
import { Badge } from '@components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'

export type MultiSelectOption = {
  value: string | number
  label: string
  color?: string
  icon?: React.ReactNode
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value?: MultiSelectOption[]
  onChange?: (value: MultiSelectOption[]) => void
  placeholder?: string
  searchable?: boolean
  creatable?: boolean
  onCreateOption?: (inputValue: string) => void | Promise<void>
  formatCreateLabel?: (inputValue: string) => string
  className?: string
  id?: string
}

function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Select...',
  searchable = true,
  creatable = false,
  onCreateOption,
  formatCreateLabel = (input) => `Create "${input}"`,
  className,
  id,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')
  const [isCreating, setIsCreating] = React.useState(false)

  const selectedValues = new Set(value.map((v) => v.value))

  const handleSelect = (option: MultiSelectOption) => {
    if (selectedValues.has(option.value)) {
      onChange?.(value.filter((v) => v.value !== option.value))
    } else {
      onChange?.([...value, option])
    }
  }

  const handleRemove = (
    e: React.MouseEvent,
    optionValue: string | number,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    onChange?.(value.filter((v) => v.value !== optionValue))
  }

  const handleCreate = async () => {
    if (!onCreateOption || !searchValue.trim()) return
    setIsCreating(true)
    try {
      await onCreateOption(searchValue.trim())
      setSearchValue('')
    } finally {
      setIsCreating(false)
    }
  }

  const showCreateOption =
    creatable &&
    searchValue.trim() !== '' &&
    !options.some(
      (o) => o.label.toLowerCase() === searchValue.trim().toLowerCase(),
    )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex min-h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs ring-offset-background focus:outline-hidden focus:ring-1 focus:ring-ring',
            className,
          )}
        >
          <div className="flex flex-1 flex-wrap gap-1">
            {value.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {value.map((item) => (
              <Badge
                key={item.value}
                variant="secondary"
                className="gap-0.5 pr-0.5"
                style={
                  item.color
                    ? {
                        backgroundColor: chroma(item.color).alpha(0.75).css(),
                        borderColor: 'transparent',
                      }
                    : undefined
                }
              >
                {item.label}
                <span
                  role="button"
                  aria-label={`Remove ${item.label}`}
                  tabIndex={0}
                  className="ml-0.5 rounded-sm p-0.5 hover:bg-black/10"
                  onMouseDown={(e) => handleRemove(e, item.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onChange?.(value.filter((v) => v.value !== item.value))
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </span>
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={searchable}>
          {searchable && (
            <CommandInput
              placeholder="Search..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
          )}
          <CommandList>
            <CommandEmpty>
              {showCreateOption ? null : 'No results found.'}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option)}
                  className="justify-between"
                >
                  <div className="flex items-center">
                    {option.icon ? (
                      <span className="mr-2 flex h-3.5 w-3.5 items-center justify-center">
                        {option.icon}
                      </span>
                    ) : (
                      option.color && (
                        <span
                          className="mr-2 inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                      )
                    )}
                    {option.label}
                  </div>
                  <Check
                    className={cn(
                      'ml-2 h-4 w-4',
                      selectedValues.has(option.value)
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
              {showCreateOption && (
                <CommandItem
                  value={searchValue}
                  onSelect={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating
                    ? 'Creating...'
                    : formatCreateLabel(searchValue.trim())}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect }
