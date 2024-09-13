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
  Divider,
  useBreakpointValue,
} from '@chakra-ui/react'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'

import VolunteerSwitch from '@components/volunteer-switch'
import DonateButton from '@components/donate-button'
import customMultiSelectStyles from '@styles/select-styles'
import { REMOTE_URL } from '@helpers/config'
import LogoImage from '../../public/logo.png'

const Drawer = ({
  categories,
  selectedCategories,
  tags,
  selectedTags,
  handleTagSelection,
  handleCategorySelection,
  handleClearSearchTermValue,
  handleSearchTermChange,
  handleVolunteerSwitchChange,
  isVolunteer,
  searchTerm,
  webDescription,
  isTransitionMode = false,
}) => {
  const maxInputWidth = useBreakpointValue({ base: 'initial', md: '280px' })

  return (
    <chakra.div
      position="fixed"
      width="300px"
      height="100vh"
      overflowY="scroll"
      backgroundColor="white"
      zIndex="3"
      boxShadow="xl"
    >
      <Flex height="100%" direction="column" justifyContent="space-between">
        <Box>
          <Link as={NextLink} href={REMOTE_URL}>
            <Flex justifyContent="center" my={2} px={4} cursor="pointer">
              <Image
                alt="Resilience Web CIC logo"
                src={LogoImage}
                width="306"
                height="104"
                unoptimized
              />
            </Flex>
          </Link>
          <Divider />
          {!isTransitionMode && (
            <>
              <Box p="1rem">
                <Link href="/new-listing" target="_blank">
                  <Button size="lg" variant="rw">
                    Propose new listing
                  </Button>
                </Link>
                <Text fontSize="0.875rem" color="gray.600" mt="0.25rem">
                  Know something that isn't yet listed? Let us know! 🙏
                </Text>
              </Box>
              <Divider />
            </>
          )}
          <Flex
            direction="column"
            alignItems="center"
            gap="1.25rem"
            my="1.25rem"
          >
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
                    onClick={handleClearSearchTermValue}
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
                value={selectedCategories}
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
            {!isTransitionMode && (
              <VolunteerSwitch
                checked={isVolunteer}
                handleSwitchChange={handleVolunteerSwitchChange}
              />
            )}
          </Flex>
          {webDescription && (
            <>
              <Divider />
              <Box mt="1.25rem" mx="0.5rem">
                <Heading as="h2" fontSize="1.25rem">
                  About this web
                </Heading>
                <Text fontSize="0.9375rem" color="gray.600">
                  {webDescription}
                </Text>
              </Box>
            </>
          )}
        </Box>
        <Box p="1rem">
          <Heading as="h2" fontSize="1.25rem">
            Support this project
          </Heading>
          <Text mb="0.75rem" color="gray.600">
            If you can, please support us via Open Collective to help us
            continue building this platform.
          </Text>
          <DonateButton />
        </Box>
      </Flex>
    </chakra.div>
  )
}

export default memo(Drawer)
