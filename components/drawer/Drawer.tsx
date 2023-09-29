import NextLink from 'next/link'
import { memo } from 'react'
import Select from 'react-select'
import Image from 'next/legacy/image'
import {
  Box,
  Flex,
  Link,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Heading,
  Button,
  Text,
  chakra,
  useBreakpointValue,
} from '@chakra-ui/react'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'

import VolunteerSwitch from '@components/volunteer-switch'
import customMultiSelectStyles from '@styles/select-styles'
import { REMOTE_URL } from '@helpers/config'
import LogoImage from '../../public/logo.png'

const Drawer = ({
  categories,
  tags,
  selectedTags,
  handleTagSelection,
  handleCategorySelection,
  handleClearSearchTermValue,
  handleSearchTermChange,
  handleVolunteerSwitchChange,
  isVolunteer,
  searchTerm,
}) => {
  const maxInputWidth = useBreakpointValue({ base: 'initial', md: '280px' })

  return (
    <chakra.div
      position="fixed"
      width="300px"
      height="100vh"
      overflowY="scroll"
      borderRight="1px solid rgb(226, 232, 240)"
      backgroundColor="white"
      zIndex="3"
    >
      <Flex height="100%" direction="column" justifyContent="space-between">
        <Box>
          <Link as={NextLink} href={REMOTE_URL}>
            <Flex justifyContent="center" my={2} px={4} cursor="pointer">
              <Image
                alt="Resilience Web logo"
                src={LogoImage}
                width="306"
                height="104"
                unoptimized
              />
            </Flex>
          </Link>
          <Heading
            as="h2"
            color="gray.700"
            fontSize="1.75rem"
            px="10px"
            mt="2rem"
          >
            Filters
          </Heading>
          <Flex direction="column" alignItems="center" gap="1.25rem" mt="1rem">
            <InputGroup
              maxW={useBreakpointValue({ base: 'initial', md: '280px' })}
            >
              <InputLeftElement color="gray.500" fontSize="lg">
                <HiOutlineSearch />
              </InputLeftElement>
              <Input
                onChange={handleSearchTermChange}
                placeholder="Search"
                value={searchTerm}
                style={{
                  backgroundColor: '#ffffff',
                  height: '38px',
                  width: '100%',
                }}
                _placeholder={{ color: '#718096', opacity: 1 }}
              />
              {searchTerm !== '' && (
                <InputRightElement>
                  <IconButton
                    aria-label="Clear search input"
                    icon={<HiOutlineX />}
                    onClick={() => handleClearSearchTermValue()}
                    size="md"
                    colorScheme="rw.900"
                    variant="ghost"
                  />
                </InputRightElement>
              )}
            </InputGroup>
            <InputGroup maxW={maxInputWidth}>
              <Select
                isMulti
                isSearchable={false}
                menuPortalTarget={document.body}
                onChange={handleCategorySelection}
                options={categories}
                placeholder="Category"
                styles={customMultiSelectStyles}
              />
            </InputGroup>
            {tags.length > 0 && (
              <InputGroup maxW={maxInputWidth}>
                <Select
                  isMulti
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  onChange={handleTagSelection}
                  options={tags}
                  placeholder="Tag"
                  styles={customMultiSelectStyles}
                  value={selectedTags}
                />
              </InputGroup>
            )}
            <VolunteerSwitch
              checked={isVolunteer}
              handleSwitchChange={handleVolunteerSwitchChange}
            />
          </Flex>
        </Box>
        <Box p="1rem">
          <Link href={`${window.location.href}new-listing`} target="_blank">
            <Button
              bg="rw.700"
              colorScheme="rw.700"
              my="2rem"
              size="lg"
              _hover={{ bg: 'rw.900' }}
            >
              Propose new listing
            </Button>
          </Link>
          <Heading as="h2" fontSize="1.25rem">
            Support this project
          </Heading>
          <Text mb="0.5rem">
            If you can, please donate to our Open Collective to help us continue
            building the platform.
          </Text>
          <Link
            href="https://opencollective.com/resilience-web"
            target="_blank"
          >
            <Button bg="rw.700" colorScheme="rw.700" _hover={{ bg: 'rw.900' }}>
              Donate
            </Button>
          </Link>
        </Box>
      </Flex>
    </chakra.div>
  )
}

export default memo(Drawer)
