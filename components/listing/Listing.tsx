import { memo, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import {
  Box,
  Heading,
  useBreakpointValue,
  Flex,
  HStack,
  Link,
  Icon,
  Button,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { SiFacebook, SiInstagram, SiTwitter } from 'react-icons/si'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { HiArrowLeft, HiUserGroup } from 'react-icons/hi'

import DescriptionRichText from '@components/main-list/description-rich-text'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import CategoryTag from '@components/category-tag'

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
    void router.push(`${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}`)
  }, [router, subdomain])

  return (
    <>
      <Box
        maxWidth={useBreakpointValue({
          base: '100%',
          md: '700px',
        })}
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
          <Image
            src={listing.image}
            alt={`Image for ${listing.title}`}
            objectFit="cover"
            height="400px"
            width="700px"
            unoptimized
            style={{
              // eslint-disable-next-line react-hooks/rules-of-hooks
              borderRadius: useBreakpointValue({
                base: 'none',
                md: '8px',
              }),
            }}
          />
        )}
        <Flex
          flexDirection={useBreakpointValue({
            base: 'column',
            md: 'row',
          })}
          width="100%"
          mb={useBreakpointValue({
            base: 6,
            md: 10,
          })}
          py={4}
          px={useBreakpointValue({
            base: 4,
            md: 2,
          })}
        >
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            width="100%"
          >
            <Box>
              <HStack>
                <Heading as="h1" data-testid="Title" pb={2}>
                  {listing.title}
                </Heading>
                <CategoryTag mb={2} colorHex={listing.category.color} size="md">
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
            <Box
              display={useBreakpointValue({
                base: 'flex',
                md: 'block',
              })}
              justifyContent="space-between"
            >
              <HStack justifyContent="space-between">
                {listing.website && (
                  <Link href={listing.website} rel="noreferrer" target="_blank">
                    <Button
                      size="md"
                      bg="rw.700"
                      colorScheme="rw.700"
                      rightIcon={<ExternalLinkIcon />}
                      mt={8}
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
          </Box>
        </Flex>
        <Box
          mb={8}
          px={useBreakpointValue({
            base: 4,
            md: 2,
          })}
        >
          <DescriptionRichText html={listing.description} />
        </Box>
      </Box>
    </>
  )
}

export default memo(Listing)
