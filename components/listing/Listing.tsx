import { memo, useCallback, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import {
  Box,
  Heading,
  Flex,
  HStack,
  Link,
  Icon,
  Button,
  Tag,
  Text,
  Tooltip,
  Grid,
} from '@chakra-ui/react'
import { SiFacebook, SiInstagram, SiTwitter } from 'react-icons/si'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { HiArrowLeft, HiUserGroup } from 'react-icons/hi'

import { useAppContext } from '@store/hooks'
import DescriptionRichText from '@components/main-list/description-rich-text'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import CategoryTag from '@components/category-tag'
import { useCategories } from '@hooks/categories'
import Item from '@components/main-list/item'

function Listing({ listing }) {
  const router = useRouter()
  const [subdomain, setSubdomain] = useState<string>()
  const { isMobile } = useAppContext()

  useEffect(() => {
    const hostname = window.location.hostname
    if (!hostname.includes('.')) {
      return null
    }

    setSubdomain(hostname.split('.')[0])
  }, [])

  const goBack = useCallback(() => {
    // void router.back()
    void router.push(`${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}`)
  }, [router, subdomain])

  const { categories } = useCategories()
  const categoriesIndexes = useMemo(() => {
    const categoriesIndexesObj = {}
    categories?.map((c, i) => (categoriesIndexesObj[c.label] = i))

    return categoriesIndexesObj
  }, [categories])

  return (
    <>
      <Box maxWidth={isMobile ? '100%' : '700px'}>
        <Button
          leftIcon={<HiArrowLeft />}
          name="Back"
          mb={2}
          ml={2}
          onClick={goBack}
          variant="link"
          color="gray.700"
        >
          Back to main list
        </Button>
        {listing.image && (
          <Image
            src={listing.image}
            alt={`Image for ${listing.title}`}
            objectFit="cover"
            height="400px"
            width="700px"
            unoptimized
            style={{
              borderRadius: isMobile ? 'none' : '8px',
            }}
          />
        )}
        <Box px={isMobile ? 4 : 2}>
          <Flex
            flexDirection={isMobile ? 'column' : 'row'}
            width="100%"
            mb={isMobile ? 6 : 10}
            py={4}
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              width="100%"
            >
              <Box>
                <HStack justifyContent="space-between">
                  <Heading as="h1" data-testid="Title" pb={2}>
                    {listing.title}
                  </Heading>
                  <CategoryTag
                    mb={2}
                    colorHex={listing.category.color}
                    size="md"
                  >
                    {listing.category.label}
                  </CategoryTag>
                </HStack>
                {listing.seekingVolunteers && (
                  <Tooltip label="This group is seeking volunteers or members. Get in touch with them if you'd like to help.">
                    <Text color="rw.900">
                      <Icon as={HiUserGroup} /> Seeking volunteers
                    </Text>
                  </Tooltip>
                )}
              </Box>
              <HStack justifyContent="space-between" mt={8} width="100%">
                {listing.website && (
                  <Link href={listing.website} rel="noreferrer" target="_blank">
                    <Button
                      size="md"
                      bg="rw.700"
                      colorScheme="rw.700"
                      rightIcon={<ExternalLinkIcon />}
                      _hover={{ bg: 'rw.900' }}
                    >
                      Visit website
                    </Button>
                  </Link>
                )}
                <HStack spacing={4}>
                  {listing.facebook && (
                    <Link href={listing.facebook} target="_blank">
                      <Icon
                        as={SiFacebook}
                        color="gray.600"
                        cursor="pointer"
                        w={8}
                        h={8}
                        transition="color 150ms"
                        _hover={{ color: 'gray.500' }}
                      />
                    </Link>
                  )}
                  {listing.twitter && (
                    <Link href={listing.twitter} target="_blank">
                      <Icon
                        as={SiTwitter}
                        color="gray.600"
                        cursor="pointer"
                        w={8}
                        h={8}
                        transition="color 150ms"
                        _hover={{ color: 'gray.500' }}
                      />
                    </Link>
                  )}
                  {listing.instagram && (
                    <Link href={listing.instagram} target="_blank">
                      <Icon
                        as={SiInstagram}
                        color="gray.600"
                        cursor="pointer"
                        w={8}
                        h={8}
                        transition="color 150ms"
                        _hover={{ color: 'gray.500' }}
                      />
                    </Link>
                  )}
                </HStack>
              </HStack>
            </Box>
          </Flex>
          <Box mb={8}>
            <DescriptionRichText html={listing.description} />
          </Box>

          <Box mt={4} mb={8} display="flex" justifyContent="flex-end">
            {listing.tags.map((tag) => (
              <Tag
                backgroundColor="gray.300"
                userSelect="none"
                key={tag.id}
                mr={1}
              >
                #{tag.label}
              </Tag>
            ))}
          </Box>

          {listing.relations.length > 0 && (
            <>
              <Heading as="h2" fontSize="xl" mb="1rem">
                Related groups
              </Heading>
              <Grid
                templateColumns={{
                  base: '1fr 1fr',
                  md: 'repeat(3, 1fr)',
                }}
                gap="1rem"
                mb="2rem"
              >
                {listing.relations.map((listing) => {
                  return (
                    <Item
                      categoriesIndexes={categoriesIndexes}
                      dataItem={listing}
                      handleClick={() => {
                        const individualListingLink = `${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}/${listing.slug}`
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        router.push(individualListingLink)
                      }}
                      key={listing.id}
                      simplified
                    />
                  )
                })}
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </>
  )
}

export default memo(Listing)
