import { memo, useEffect, useState } from 'react'
import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
} from '@chakra-ui/react'
import Select from 'react-select'
import { HiOutlineSearch, HiPlus } from 'react-icons/hi'
import useCategories from '@hooks/categories/useCategories'
import customMultiSelectStyles from '@styles/select-styles'
import useHasPermissionForCurrentWeb from '@hooks/permissions/useHasPermissionForCurrentWeb'
import useIsOwnerOfCurrentWeb from '@hooks/ownership/useIsOwnerOfCurrentWeb'

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
    <Stack
      direction={{
        base: 'column',
        md: 'row',
      }}
      spacing="4"
      justify="flex-start"
      flex="1"
    >
      {(hasPermissionForCurrentWeb || isOwnerOfCurrentWeb) && (
        <>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing="1rem"
            flex="1"
          >
            <InputGroup minW="250px">
              <Select
                isMulti
                isSearchable={false}
                menuPortalTarget={document.body}
                onChange={handleSelectedCategoriesChange}
                options={categories}
                placeholder="Filter by category"
                styles={customMultiSelectStyles}
              />
            </InputGroup>
            <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                color="gray.400"
                fontSize="xl"
              >
                <HiOutlineSearch />
              </InputLeftElement>
              <Input
                placeholder="Search"
                onChange={handleSearchTermChange}
                style={{
                  backgroundColor: '#ffffff',
                }}
                value={searchTerm}
                maxHeight="38px"
                borderRadius="10px"
              />
            </InputGroup>
          </Stack>
          <Button
            leftIcon={<HiPlus fontSize="1.25em" />}
            onClick={goToCreateListing}
            variant="rw"
            size="lg"
            maxHeight="36px"
            data-tourid="new-listing"
          >
            New listing
          </Button>
        </>
      )}
    </Stack>
  )
}

export default memo(TableActions)
