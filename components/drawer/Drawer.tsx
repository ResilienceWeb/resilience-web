import { track } from '@vercel/analytics'
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
import { HiHeart, HiOutlineSearch, HiOutlineX } from 'react-icons/hi'

import VolunteerSwitch from '@components/volunteer-switch'
import customMultiSelectStyles from '@styles/select-styles'
import { REMOTE_URL } from '@helpers/config'
import { useSelectedWebName } from '@hooks/webs'
import LogoImage from '../../public/logo.png'
import styles from './Drawer.module.scss'

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
  const selectedWebName = useSelectedWebName()

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
                alt="Resilience Web logo"
                src={LogoImage}
                width="306"
                height="104"
                unoptimized
              />
            </Flex>
          </Link>
          <Divider />
          <Box p="1rem">
            <Link href={`${window.location.href}new-listing`} target="_blank">
              <Button
                bg="rw.700"
                colorScheme="rw.700"
                size="lg"
                _hover={{ bg: 'rw.900' }}
              >
                Propose new listing
              </Button>
            </Link>
            <Text fontSize="0.875rem" color="gray.600" mt="0.25rem">
              Know something that isn't yet listed? Let us know!
            </Text>
          </Box>
          <Divider />
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
          <Heading as="h2" fontSize="1.25rem">
            Support this project
          </Heading>
          <Text mb="0.75rem">
            If you can, please support us via Open Collective to help us
            continue building this platform.
          </Text>
          <Link
            href="https://opencollective.com/resilience-web"
            target="_blank"
          >
            <Button
              className={styles.donateButton}
              colorScheme="rw.700"
              size="lg"
              onClick={() => track('donate-click', { web: selectedWebName })}
              rightIcon={<HiHeart />}
            >
              Donate
            </Button>
          </Link>
        </Box>
      </Flex>
    </chakra.div>
  )
}

export default memo(Drawer)
