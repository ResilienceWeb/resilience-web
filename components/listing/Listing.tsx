import { memo, useCallback, useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Box,
  Heading,
  Flex,
  HStack,
  Link,
  Icon,
  Button,
  IconButton,
  Tag,
  Text,
  Tooltip,
  Grid,
} from '@chakra-ui/react'
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'
import { FiEdit } from 'react-icons/fi'
import { SlGlobe } from 'react-icons/sl'
import { HiArrowLeft, HiUserGroup } from 'react-icons/hi'

import DescriptionRichText from '@components/main-list/description-rich-text'
import { PROTOCOL, REMOTE_HOSTNAME, REMOTE_URL } from '@helpers/config'
import CategoryTag from '@components/category-tag'
import useCategoriesPublic from '@hooks/categories/useCategoriesPublic'
import Item from '@components/main-list/item'

const ListingMap = dynamic(() => import('./listing-map'), {
  ssr: false,
  loading: () => (
    <div style={{ textAlign: 'center', paddingTop: 20 }}>Loading…</div>
  ),
})

function Listing({ listing }) {
  const router = useRouter()
  const [subdomain, setSubdomain] = useState<string>()

  useEffect(() => {
    const hostname = window.location.hostname
    if (!hostname.includes('.')) {
      return
    }

    setSubdomain(hostname.split('.')[0])
  }, [])

  const goBack = useCallback(() => {
    const referrer = document.referrer
    if (referrer.includes('google') || referrer.includes('bing')) {
      void router.push(`${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}`)
    } else {
      router.back()
    }
  }, [router, subdomain])

  const { categories } = useCategoriesPublic({ webSlug: subdomain })
  const categoriesIndexes = useMemo(() => {
    const categoriesIndexesObj = {}
    categories?.map((c, i) => (categoriesIndexesObj[c.label] = i))

    return categoriesIndexesObj
  }, [categories])

  const listingWebsite = useMemo(() => {
    if (!listing?.website) {
      return null
    }

    if (listing.website.includes('http')) {
      return listing.website
    }

    return `//${listing.website}`
  }, [listing.website])

  return (
    <>
      <Box
        maxWidth={{ base: '100%', md: '700px' }}
        minWidth={{ base: 'initial', md: '684px' }}
        mt="1rem"
      >
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
              style={{ objectFit: 'contain' }}
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
                    <Link href={listingWebsite} target="_blank">
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
                        as={FaFacebook}
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
                        as={FaTwitter}
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
                        as={FaInstagram}
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

          {listing.location?.latitude &&
            listing.location?.longitude &&
            listing.location?.description && (
              <ListingMap
                latitude={listing.location.latitude}
                longitude={listing.location.longitude}
                locationDescription={listing.location.description}
              />
            )}

          <Box
            mt="2rem"
            mb={8}
            display="flex"
            justifyContent="flex-end"
            flexWrap="wrap"
            gap="0.25rem"
          >
            {listing.tags?.map((tag) => {
              const urlEncodedTag = tag.label.replace(' ', '+')
              return (
                <NextLink
                  key={tag.id}
                  href={`${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}?tags=${urlEncodedTag}`}
                >
                  <Tag
                    backgroundColor={tag.color ?? 'gray.300'}
                    userSelect="none"
                    cursor="pointer"
                    transition="opacity 0.2s ease"
                    _hover={{ opacity: 0.9 }}
                  >
                    #{tag.label}
                  </Tag>
                </NextLink>
              )
            })}
          </Box>

          {listing.relations?.length > 0 && (
            <>
              <Heading as="h2" fontSize="xl" mb="1rem">
                Related listings
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
      <Box position="fixed" bottom="2rem" right="2rem" zIndex={10}>
        <Link href={`${REMOTE_URL}/edit/${subdomain}/${listing.slug}`}>
          <IconButton
            icon={<FiEdit />}
            variant="solid"
            aria-label="Edit listing"
            fontSize="1.5rem"
            width="60px"
            height="60px"
            borderRadius="50%"
            colorScheme="blue"
          />
        </Link>
      </Box>
    </>
  )
}

export default memo(Listing)
