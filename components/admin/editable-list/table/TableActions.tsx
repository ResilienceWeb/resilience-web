import { memo } from 'react'
import { HiOutlineSearch, HiPlus } from 'react-icons/hi'
import { icons } from '@helpers/icons'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { MultiSelect } from '@components/ui/multi-select'
import useCategories from '@hooks/categories/useCategories'
import useCanEditWeb from '@hooks/web-access/useCanEditWeb'

const TableActions = ({
  searchTerm,
  handleSearchTermChange,
  handleSelectedCategoriesChange,
  selectedCategoryLabels,
  goToCreateListing,
}) => {
  const { canEdit: canEditWeb } = useCanEditWeb()

  const { categories: fetchedCategories } = useCategories()

  const categories = (() => {
    if (!fetchedCategories) return []

    return fetchedCategories.map((c) => {
      const color = `#${c.color}`
      const IconComponent =
        c.icon && c.icon !== 'default'
          ? icons.find((i) => i.name === c.icon)?.icon
          : undefined

      return {
        value: c.label,
        label: c.label,
        color,
        icon: IconComponent ? <IconComponent style={{ color }} /> : undefined,
      }
    })
  })()

  const selectedCategories = categories.filter((category) =>
    selectedCategoryLabels?.includes(category.value),
  )

  return (
    <div className="flex flex-1 flex-col justify-start gap-4 md:flex-row">
      {canEditWeb && (
        <>
          <div className="flex flex-1 flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                <HiOutlineSearch />
              </div>
              <Input
                placeholder="Search"
                onChange={handleSearchTermChange}
                value={searchTerm}
                className="h-[38px] pl-10"
              />
            </div>
            <div className="flex-1">
              <MultiSelect
                searchable={false}
                onChange={handleSelectedCategoriesChange}
                options={categories}
                value={selectedCategories}
                placeholder="Filter by category"
              />
            </div>
          </div>
          <Button
            onClick={goToCreateListing}
            variant="default"
            size="lg"
            className="h-[36px]"
            data-tourid="new-listing"
          >
            <HiPlus className="text-xl" />
            New listing
          </Button>
        </>
      )}
    </div>
  )
}

export default memo(TableActions)
