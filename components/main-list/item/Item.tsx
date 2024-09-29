import { useCallback, useMemo, useRef, useEffect, useState, memo } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import chroma from 'chroma-js'
import { Box, Flex, Text, Icon, Tooltip, chakra } from '@chakra-ui/react'
import { HiUserGroup } from 'react-icons/hi'
import { FaStar } from 'react-icons/fa'

import CategoryTag from '@components/category-tag'
import ListingImage from '@components/listing-image'

import ImagePlaceholder from './image-placeholder'

type Props = {
  categoriesIndexes: Record<string, number>
  dataItem: ListingNodeType
  handleClick: (dataItem: ListingNodeType) => void
  simplified?: boolean
}

const Item = ({
  categoriesIndexes,
  dataItem,
  handleClick,
  simplified = false,
}: Props) => {
  const [isWithinAFewSecondsOfRender, setIsWithinAFewSecondsOfRender] =
    useState<boolean>(true)
  const ref = useRef(null)
  const isInView = useInView(ref)
  const animation = useAnimation()

  useEffect(() => {
    setTimeout(() => {
      setIsWithinAFewSecondsOfRender(false)
    }, 3000)
  }, [])

  useEffect(() => {
    if (isInView) {
      animation
        .start({
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            duration: 0.4,
            bounce: 0.3,
          },
        })
        .catch((e) => console.error('Animation error', e))
    }
  }, [animation, isInView])

  const onClick = useCallback(() => {
    handleClick(dataItem)
  }, [dataItem, handleClick])

  const categoryBackgroundColor = useMemo(
    () => chroma(dataItem.category.color).alpha(0.5).css(),
    [dataItem.category.color],
  )

  const categoryIndex = useMemo(
    () => categoriesIndexes?.[dataItem.category.label],
    [categoriesIndexes, dataItem.category.label],
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      exit={{ opacity: 0 }}
      animate={animation}
      whileHover={{ scale: simplified ? 1 : 1.05 }}
    >
      <chakra.div
        height="fit-content"
        cursor="pointer"
        borderRadius="5px"
        backgroundColor="#ffffff"
        transition="transform 300ms ease-in-out, box-shadow 300ms ease-in-out"
        onClick={onClick}
        boxShadow="md"
        position="relative"
        _hover={{ boxShadow: 'xl' }}
        ref={ref}
      >
        {dataItem.featured && (
          <Tooltip
            borderRadius="md"
            label="Featured listing"
            placement="right-end"
          >
            <span>
              <Icon
                as={FaStar}
                position="absolute"
                width="26px"
                height="26px"
                color="yellow.200"
                top="4px"
                left="4px"
              />
            </span>
          </Tooltip>
        )}
        <CategoryTag
          alpha={1}
          colorHex={dataItem.category.color}
          height="26px"
          minWidth="fit-content"
          boxShadow="lg"
          position="absolute"
          zIndex="2"
          top="4px"
          right="4px"
        >
          {dataItem.category.label}
        </CategoryTag>
        {dataItem.image ? (
          <Box
            width="100%"
            height="170px"
            overflow="hidden"
            position="relative"
          >
            <ListingImage
              alt={`${dataItem.label} cover image`}
              src={dataItem.image}
              sizes="(max-width: 768px) 90vw, 300px"
              isInView={isInView}
              priority={isInView && isWithinAFewSecondsOfRender}
            />
          </Box>
        ) : (
          categoryIndex !== null &&
          categoryIndex !== undefined && (
            <ImagePlaceholder
              backgroundColor={categoryBackgroundColor}
              categoryIndex={categoryIndex}
            />
          )
        )}
        <Box px={3} pb={3}>
          <Flex justifyContent="space-between" mt={3}>
            <chakra.h2
              fontSize={15}
              fontWeight={600}
              color="#454545"
              mb={0}
              noOfLines={3}
            >
              {dataItem.label ?? dataItem.title}
            </chakra.h2>
          </Flex>
          {dataItem.seekingVolunteers && !simplified && (
            <Flex>
              <Tooltip
                borderRadius="md"
                label="This group is seeking volunteers or members. Get in touch with them if you'd like to help."
              >
                <Text color="rw.900" fontSize="sm">
                  Seeking volunteers <Icon as={HiUserGroup} />
                </Text>
              </Tooltip>
            </Flex>
          )}
        </Box>
      </chakra.div>
    </motion.div>
  )
}

export default memo(Item)
