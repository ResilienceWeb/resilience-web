import { useCallback, useMemo, useEffect, useState, memo } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'
import chroma from 'chroma-js'
import { Box, Flex, Text, Icon, Tooltip, chakra } from '@chakra-ui/react'
import { HiUserGroup } from 'react-icons/hi'

import CategoryTag from '@components/category-tag'

import ImagePlaceholder from './image-placeholder'

const Item = ({ categoriesIndexes, dataItem, onOpenDialog }) => {
  const [isWithinAFewSecondsOfRender, setIsWithinAFewSecondsOfRender] =
    useState<boolean>(true)
  const { ref, inView } = useInView()
  const animation = useAnimation()

  useEffect(() => {
    setInterval(() => {
      setIsWithinAFewSecondsOfRender(false)
    }, 3000)
  }, [])

  useEffect(() => {
    if (inView) {
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
  }, [animation, inView])

  const openDialog = useCallback(() => {
    onOpenDialog(dataItem)
  }, [dataItem, onOpenDialog])

  const tagBackgroundColor = useMemo(
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
      whileHover={{ scale: 1.05 }}
    >
      <chakra.div
        height="fit-content"
        cursor="pointer"
        borderRadius="5px"
        backgroundColor="#ffffff"
        transition="transform 300ms ease-in-out, box-shadow 300ms ease-in-out"
        onClick={openDialog}
        boxShadow="md"
        opacity={dataItem.inactive ? 0.7 : 1}
        position="relative"
        _hover={{ boxShadow: 'xl' }}
        ref={ref}
      >
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
          <Image
            alt={`${dataItem.title} cover image`}
            src={dataItem.image}
            objectFit="cover"
            width="300px"
            height="170px"
            layout="responsive"
            unoptimized
            priority={inView && isWithinAFewSecondsOfRender}
            style={{
              borderTopLeftRadius: '.375rem',
              borderTopRightRadius: '.375rem',
            }}
          />
        ) : (
          categoryIndex !== null &&
          categoryIndex !== undefined && (
            <ImagePlaceholder
              backgroundColor={tagBackgroundColor}
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
              {dataItem.title}
            </chakra.h2>
          </Flex>
          {dataItem.seekingVolunteers && (
            <Flex>
              <Tooltip
                backgroundColor="whiteAlpha.900"
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
