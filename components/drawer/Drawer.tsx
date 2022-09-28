import NextLink from 'next/link'
import { memo } from 'react'
import Select from 'react-select'
import Image from 'next/image'
import { Flex, Link, InputGroup, useBreakpointValue } from '@chakra-ui/react'

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
}) => {
  return (
    <div className={styles.drawer}>
      <Link as={NextLink} href={REMOTE_URL}>
        <Flex justifyContent="center" my={2} px={4}>
          <Image
            alt="Cambridge Resilience Web logo"
            src={LogoImage}
            width="306"
            height="104"
            unoptimized
          />
        </Flex>
      </Link>
      <Flex direction="column" alignItems="center" gap="1.25rem" mt="2rem">
        <InputGroup maxW={useBreakpointValue({ base: 'initial', md: '280px' })}>
          <Select
            isMulti
            isSearchable={false}
            onChange={handleCategorySelection}
            options={categories}
            placeholder="Filter by category"
            styles={customMultiSelectStyles}
          />
        </InputGroup>
        <InputGroup maxW={useBreakpointValue({ base: 'initial', md: '280px' })}>
          <Select
            isMulti
            isSearchable={false}
            onChange={handleTagSelection}
            options={tags}
            placeholder="Filter by tag"
            styles={customMultiSelectStyles}
            value={selectedTags}
          />
        </InputGroup>
      </Flex>
    </div>
  )
}

export default memo(Drawer)
