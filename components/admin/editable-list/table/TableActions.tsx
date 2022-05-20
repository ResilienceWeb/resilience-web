import {
    Button,
    FormControl,
    FormLabel,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Stack,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { memo } from 'react'
import { HiOutlineSearch, HiPlus } from 'react-icons/hi'

const TableActions = ({ filterValue, onFilterChange, goToCreateListing }) => {
    const { data: session } = useSession()

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
                    <HStack>
                        <FormControl id="search">
                            <InputGroup size="sm">
                                <FormLabel srOnly>Filter by title</FormLabel>
                                <InputLeftElement
                                    pointerEvents="none"
                                    color="gray.400"
                                    fontSize="xl"
                                >
                                    <HiOutlineSearch />
                                </InputLeftElement>
                                <Input
                                    placeholder="Filter by title…"
                                    onChange={onFilterChange}
                                    style={{
                                        backgroundColor: '#ffffff',
                                    }}
                                    rounded="base"
                                    value={filterValue}
                                />
                            </InputGroup>
                        </FormControl>
                    </HStack>
                    <Button
                        bg="rw.700"
                        colorScheme="rw.700"
                        iconSpacing="1"
                        leftIcon={<HiPlus fontSize="1.25em" />}
                        onClick={goToCreateListing}
                        variant="solid"
                        size="sm"
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
