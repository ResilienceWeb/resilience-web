import { getIcon } from '@helpers/icons'
import type { MultiSelectOption } from '@components/ui/multi-select'

/** A tag as a choice in a listing form's tag picker, with its icon if it has one. */
export function tagOption(tag: {
  id: number
  label: string
  icon?: string | null
}): MultiSelectOption {
  const icon = getIcon(tag.icon)
  return {
    value: tag.id,
    label: tag.label,
    icon: icon ? (
      <icon.monochrome className="h-full w-full" aria-hidden="true" />
    ) : undefined,
  }
}
