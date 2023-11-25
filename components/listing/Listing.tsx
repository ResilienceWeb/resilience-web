import { memo, useCallback, useEffect, useState, useMemo } from 'react'
import NextLink from 'next/link'
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
import { SlGlobe } from 'react-icons/sl'
import { HiArrowLeft, HiUserGroup } from 'react-icons/hi'

import DescriptionRichText from '@components/main-list/description-rich-text'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import CategoryTag from '@components/category-tag'
import { useCategories } from '@hooks/categories'
import Item from '@components/main-list/item'
import { encodeUriElements } from '@helpers/routes'

function Listing({ listing }) {
  const router = useRouter()
  const [subdomain, setSubdomain] = useState<string>()

  useEffect(() => {
    const hostname = window.location.hostname
    if (!hostname.includes('.')) {
      return null
    }

    setSubdomain(hostname.split('.')[0])
  }, [])

  const goBack = useCallback(() => {
    void router.back()
    // void router.push(`${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}`)
  }, [router])

  const { categories } = useCategories()
  const categoriesIndexes = useMemo(() => {
    const categoriesIndexesObj = {}
    categories?.map((c, i) => (categoriesIndexesObj[c.label] = i))

    return categoriesIndexesObj
  }, [categories])

  return (
    <>
      <Box maxWidth={{ base: '100%', md: '700px' }} mt="1rem">
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
          <Box
            borderRadius={{ base: 'none', md: '8px' }}
            overflow="hidden"
            position="relative"
            width={{ base: '100vw', md: '700px' }}
            height={{ base: '250px', md: '400px' }}
          >
            <Image
              src={listing.image}
              alt={`Image for ${listing.title}`}
              sizes="(max-width: 768px) 100vw, 700px"
              fill
              priority
              style={{ objectFit: 'cover' }}
            />
          </Box>
        )}
        <Box px={{ base: 4, md: 2 }}>
          <Flex
            flexDirection={{ base: 'column', md: 'row' }}
            width="100%"
            mb={{ base: 6, md: 10 }}
            py={4}
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              width="100%"
            >
              <Heading as="h1" data-testid="Title">
                {listing.title}
              </Heading>
              <HStack justifyContent="space-between" mt={8} width="100%">
                <Box>
                  <CategoryTag
                    mb={2}
                    colorHex={listing.category.color}
                    size="md"
                  >
                    {listing.category.label}
                  </CategoryTag>
                  {listing.seekingVolunteers && (
                    <Tooltip
                      borderRadius="md"
                      label="This group is seeking volunteers or members. Get in touch with them if you'd like to help."
                    >
                      <Text color="rw.900">
                        <Icon as={HiUserGroup} /> Seeking volunteers
                      </Text>
                    </Tooltip>
                  )}
                </Box>
                <HStack spacing={4}>
                  {listing.website && (
                    <Link href={listing.website} target="_blank">
                      <Icon
                        as={SlGlobe}
                        color="gray.600"
                        cursor="pointer"
                        w={8}
                        h={8}
                        transition="color 150ms"
                        _hover={{ color: 'gray.500' }}
                      />
                    </Link>
                  )}
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
            {listing.tags.map((tag) => {
              const urlEncodedTag = encodeUriElements([tag.label])
              return (
                <NextLink
                  key={tag.id}
                  href={{
                    pathname: `${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}`,
                    query: { tags: urlEncodedTag },
                  }}
                >
                  <Tag
                    backgroundColor="gray.200"
                    userSelect="none"
                    mr={1}
                    cursor="pointer"
                    transition="background-color 0.2s ease"
                    _hover={{ bgColor: 'gray.300' }}
                  >
                    #{tag.label}
                  </Tag>
                </NextLink>
              )
            })}
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
                {listing.relations.map((relatedListing) => {
                  return (
                    <Item
                      categoriesIndexes={categoriesIndexes}
                      dataItem={relatedListing}
                      handleClick={() => {
                        const individualListingLink = `${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}/${relatedListing.slug}`
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        router.push(individualListingLink)
                      }}
                      key={relatedListing.id}
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
