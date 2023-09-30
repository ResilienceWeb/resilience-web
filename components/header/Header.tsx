import { memo } from 'react'
import NextLink from 'next/link'
import Select from 'react-select'
import Image from 'next/legacy/image'
import {
  Box,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Flex,
  Input,
  Button,
  VStack,
  HStack,
  Link,
  Heading,
  Text,
  chakra,
} from '@chakra-ui/react'
import { HiOutlineSearch, HiHome, HiOutlineX } from 'react-icons/hi'
import ModeSwitch from '@components/mode-switch'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import customMultiSelectStyles from '@styles/select-styles'

const Header = ({
  categories,
  handleCategorySelection,
  handleSearchTermChange,
  handleSwitchChange,
  handleTagSelection,
  handleClearSearchTermValue,
  isMobile,
  isWebMode,
  searchTerm,
  tags,
  selectedTags,
  selectedWebName,
}) => {
  if (isMobile) {
    return (
      <>
        <Link as={NextLink} href={`${PROTOCOL}://${REMOTE_HOSTNAME}`}>
          <Button
            leftIcon={<HiHome />}
            colorScheme="blue"
            variant="solid"
            size="sm"
            mt={2}
            ml={2}
          >
            Homepage
          </Button>
        </Link>
        <Flex
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Box my={4}>
            <Image
              alt="Resilience Web logo"
              src="/logo.png"
              width="306"
              height="104"
              unoptimized
            />
          </Box>
          <Heading as="h2" fontSize="2.25rem" position="relative">
            <Text
              as="span"
              position="relative"
              zIndex={1}
              _after={{
                content: "''",
                width: 'full',
                height: '23%',
                position: 'absolute',
                bottom: 1,
                left: 0,
                bg: 'rw.700',
                zIndex: -1,
              }}
            >
              {selectedWebName}
            </Text>
          </Heading>
          <chakra.div paddingTop={4} width={'95%'}>
            <VStack spacing={2}>
              <InputGroup
                maxW={isWebMode ? '250px' : isMobile ? '100%' : '300px'}
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
              <InputGroup>
                <Select
                  isMulti
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  onChange={handleCategorySelection}
                  options={categories}
                  placeholder="Filter by category"
                  styles={customMultiSelectStyles}
                />
              </InputGroup>
              <InputGroup>
                <Select
                  isMulti
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  onChange={handleTagSelection}
                  options={tags}
                  placeholder="Filter by tag"
                  styles={customMultiSelectStyles}
                  value={selectedTags}
                />
              </InputGroup>
            </VStack>
          </chakra.div>
        </Flex>
      </>
    )
  }

  return (
    <Box transition=".3s ease">
      <Flex
        as="header"
        align="center"
        w="full"
        px="4"
        bg="white"
        borderBottomWidth="1px"
        borderColor="inherit"
        h="14"
      >
        <HStack spacing={2} width="100%">
          <Heading as="h2" color="gray.700" fontSize="1.75rem" px="10px">
            {selectedWebName}
          </Heading>
        </HStack>
        <ModeSwitch
          checked={isWebMode}
          handleSwitchChange={handleSwitchChange}
        />
        <Link as={NextLink} href={`${PROTOCOL}://${REMOTE_HOSTNAME}`}>
          <Button leftIcon={<HiHome />} colorScheme="blue" size="sm" px={6}>
            Homepage
          </Button>
        </Link>
      </Flex>
    </Box>
  )
}

export default memo(Header)
