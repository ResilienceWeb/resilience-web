import { memo, useEffect, useState } from 'react'
import {
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
} from '@chakra-ui/react'
import Select from 'react-select'
import { useSession } from 'next-auth/react'
import { HiOutlineSearch, HiPlus } from 'react-icons/hi'
import { useCategories } from '@hooks/categories'
import customMultiSelectStyles from '@styles/select-styles'

const TableActions = ({
  searchTerm,
  handleSearchTermChange,
  handleSelectedCategoriesChange,
  goToCreateListing,
}) => {
  const { data: session } = useSession()

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
      justify="flex-end"
      flex="1"
      w={{
        base: 'full',
        md: 'auto',
      }}
    >
      {session?.user?.admin && (
        <>
          <HStack spacing="1rem">
            <InputGroup minW="250px">
              <Select
                isMulti
                isSearchable={false}
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
                rounded="base"
                value={searchTerm}
                maxHeight="38px"
              />
            </InputGroup>
          </HStack>
          <Button
            bg="rw.700"
            colorScheme="rw.700"
            iconSpacing="1"
            leftIcon={<HiPlus fontSize="1.25em" />}
            onClick={goToCreateListing}
            variant="solid"
            size="md"
            maxHeight="36px"
            _hover={{ bg: 'rw.900' }}
          >
            New listing
          </Button>
        </>
      )}
    </Stack>
  )
}

export default memo(TableActions)
