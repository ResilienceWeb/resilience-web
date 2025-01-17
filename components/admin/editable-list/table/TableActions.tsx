import { memo, useEffect, useState } from 'react'
import Select from 'react-select'
import { HiOutlineSearch, HiPlus } from 'react-icons/hi'
import useCategories from '@hooks/categories/useCategories'
import customMultiSelectStyles from '@styles/select-styles'
import useHasPermissionForCurrentWeb from '@hooks/permissions/useHasPermissionForCurrentWeb'
import useIsOwnerOfCurrentWeb from '@hooks/ownership/useIsOwnerOfCurrentWeb'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'

const TableActions = ({
  searchTerm,
  handleSearchTermChange,
  handleSelectedCategoriesChange,
  goToCreateListing,
}) => {
  const hasPermissionForCurrentWeb = useHasPermissionForCurrentWeb()
  const isOwnerOfCurrentWeb = useIsOwnerOfCurrentWeb()

  const { categories: fetchedCategories } = useCategories()
  const [categories, setCategories] = useState<any[]>()

  useEffect(() => {
    if (!fetchedCategories) return

    const mappedCategories = fetchedCategories.map((c) => ({
      value: c.label,
      label: c.label,
      color: `#${c.color}`,
    }))

    setCategories(mappedCategories)
  }, [fetchedCategories])

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-start flex-1">
      {(hasPermissionForCurrentWeb || isOwnerOfCurrentWeb) && (
        <>
          <div className="flex flex-col md:flex-row gap-4 flex-1">
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
            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                <HiOutlineSearch />
              </div>
              <Input
                placeholder="Search"
                onChange={handleSearchTermChange}
                value={searchTerm}
                className="h-[38px] pl-10 bg-white rounded-[10px]"
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
