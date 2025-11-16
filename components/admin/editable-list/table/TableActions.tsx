import { memo, useMemo } from 'react'
import { HiOutlineSearch, HiPlus } from 'react-icons/hi'
import Select from 'react-select'
import customMultiSelectStyles from '@styles/select-styles'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import useCategories from '@hooks/categories/useCategories'
import useCanEditWeb from '@hooks/web-access/useCanEditWeb'

const TableActions = ({
  searchTerm,
  handleSearchTermChange,
  handleSelectedCategoriesChange,
  goToCreateListing,
}) => {
  const { canEdit: canEditWeb } = useCanEditWeb()

  const { categories: fetchedCategories } = useCategories()

  const categories = useMemo(() => {
    if (!fetchedCategories) return []

    return fetchedCategories.map((c) => ({
      value: c.label,
      label: c.label,
      color: `#${c.color}`,
    }))
  }, [fetchedCategories])

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
              <Select
                isMulti
                isSearchable={false}
                menuPortalTarget={document.body}
                onChange={handleSelectedCategoriesChange}
                options={categories}
                placeholder="Filter by category"
                styles={customMultiSelectStyles}
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
