import NextLink from 'next/link'
import { memo } from 'react'
import Select from 'react-select'
import Image from 'next/image'
import {
  Box,
  Flex,
  Link,
  InputGroup,
  Text,
  Heading,
  useBreakpointValue,
} from '@chakra-ui/react'

import VolunteerSwitch from '@components/volunteer-switch'
import customMultiSelectStyles from '@styles/select-styles'
import { REMOTE_URL } from '@helpers/config'
import styles from './Drawer.module.scss'
import LogoImage from '../../public/logo.png'

const Drawer = ({
  categories,
  tags,
  selectedTags,
  handleTagSelection,
  handleCategorySelection,
  handleVolunteerSwitchChange,
  isVolunteer,
}) => {
  return (
    <div className={styles.drawer}>
      <Flex height="100%" direction="column" justifyContent="space-between">
        <Box>
          <Link as={NextLink} href={REMOTE_URL}>
            <Flex justifyContent="center" my={2} px={4} cursor="pointer">
              <Image
                alt="Cambridge Resilience Web logo"
                src={LogoImage}
                width="306"
                height="104"
                unoptimized
              />
            </Flex>
          </Link>
          <Heading as="h2" fontSize="1.75rem" px="10px" mt="2rem">
            Filters
          </Heading>
          <Flex direction="column" alignItems="center" gap="1.25rem" mt="1rem">
            <InputGroup
              maxW={useBreakpointValue({ base: 'initial', md: '280px' })}
            >
              <Select
                isMulti
                isSearchable={false}
                onChange={handleCategorySelection}
                options={categories}
                placeholder="Category"
                styles={customMultiSelectStyles}
              />
            </InputGroup>
            <InputGroup
              maxW={useBreakpointValue({ base: 'initial', md: '280px' })}
            >
              <Select
                isMulti
                isSearchable={false}
                onChange={handleTagSelection}
                options={tags}
                placeholder="Tag"
                styles={customMultiSelectStyles}
                value={selectedTags}
              />
            </InputGroup>
            <VolunteerSwitch
              checked={isVolunteer}
              handleSwitchChange={handleVolunteerSwitchChange}
            />
          </Flex>
        </Box>
        {/* <Box p="1rem">
          <Heading as="h2" fontSize="1.5rem">
            Instructions
          </Heading>
          <Text>Some instructions here</Text>
        </Box> */}
      </Flex>
    </div>
  )
}

export default memo(Drawer)
