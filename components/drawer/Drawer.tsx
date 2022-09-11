import NextLink from 'next/link'
import { memo } from 'react'
import Select from 'react-select'
import Image from 'next/image'
import chroma from 'chroma-js'
import { Flex, Link, InputGroup, useBreakpointValue } from '@chakra-ui/react'

import { REMOTE_URL } from '@helpers/config'
import styles from './Drawer.module.scss'
import LogoImage from '../../public/logo.png'

const customMultiSelectStyles = {
  container: () => ({
    width: '100%',
  }),
  control: (provided) => {
    return {
      ...provided,
      borderColor: '#E2E8F0',
      borderRadius: '0.375rem',
    }
  },
  placeholder: (provided) => {
    return {
      ...provided,
      color: '#718096',
    }
  },
  option: (provided, state) => {
    return {
      ...provided,
      color: state.data.color,
    }
  },
  multiValue: (styles, { data }) => {
    const color = data.color ? chroma(data.color) : chroma('#718096')
    return {
      ...styles,
      fontSize: '14px',
      backgroundColor: color.alpha(0.5).css(),
    }
  },
  multiValueLabel: (styles) => ({
    ...styles,
    color: '#000',
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: data.color,
    ':hover': {
      backgroundColor: data.color,
      color: 'white',
    },
  }),
}

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
