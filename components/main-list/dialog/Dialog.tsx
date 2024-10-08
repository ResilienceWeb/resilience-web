import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import NextLink from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  Icon,
  HStack,
  Link,
  Flex,
  Tooltip,
  Text,
  Button,
  Tag,
  useToast,
} from '@chakra-ui/react'
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'
import { HiUserGroup, HiOutlineLink, HiExternalLink } from 'react-icons/hi'
import { sanitizeLink } from '@helpers/utils'
import { REMOTE_HOSTNAME, PROTOCOL } from '@helpers/config'
import DescriptionRichText from '@components/main-list/description-rich-text'
import CategoryTag from '@components/category-tag'
import ListingImage from '@components/listing-image'
import styles from './Dialog.module.scss'

const Dialog = ({
  isOpen,
  isMobile,
  item,
  onClose,
}: {
  isOpen: boolean
  isMobile?: boolean
  item: any
  onClose: () => void
}) => {
  const toast = useToast()
  const [subdomain, setSubdomain] = useState<string>()

  const websiteSanitized = useMemo(
    () => sanitizeLink(item.website),
    [item.website],
  )

  const showCopiedToClipboardToast = useCallback(() => {
    toast({
      title: 'Copied to clipboard',
      description:
        'The link to this listing is copied to your clipboard and ready to be shared.',
      status: 'info',
      duration: 4000,
    })
  }, [toast])

  useEffect(() => {
    const hostname = window.location.hostname
    if (!hostname.includes('.')) {
      return
    }

    setSubdomain(hostname.split('.')[0])
  }, [])

  const individualListingLink = `${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}/${item.slug}`
  const handleShareButtonClick = useCallback(() => {
    void navigator.clipboard.writeText(individualListingLink)
    showCopiedToClipboardToast()
  }, [showCopiedToClipboardToast, individualListingLink])

  const socialLinks = (
    <>
      <HStack spacing={4}>
        {item.facebook && (
          <Link href={item.facebook} target="_blank">
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
        {item.twitter && (
          <Link href={item.twitter} target="_blank">
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
        {item.instagram && (
          <Link href={item.instagram} target="_blank">
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
        {item.seekingVolunteers && (
          <Flex justifyContent="right">
            <Tooltip
              borderRadius="md"
              label="This group is seeking volunteers or members. Get in touch with them if you'd like to help."
            >
              <Text color="rw.900">
                Seeking volunteers <Icon as={HiUserGroup} />
              </Text>
            </Tooltip>
          </Flex>
        )}
      </HStack>
    </>
  )

  const listingWebsite = useMemo(() => {
    if (!item?.website) {
      return null
    }

    if (item.website.includes('http')) {
      return item.website
    }

    return `//${item.website}`
  }, [item.website])

  const searchParams = useSearchParams()
  const webSearchParam = searchParams.get('web')

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '2xl' }}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        {item.image && (
          <Box
            width="672px"
            height="300px"
            minHeight="300px"
            overflow="hidden"
            position="relative"
          >
            <ListingImage
              alt={`${item.label} cover image`}
              sizes="(max-width: 768px) 100vw, 672px"
              src={item.image}
              imageObjectFit="contain"
            />
          </Box>
        )}

        <ModalHeader display="flex" alignItems="center" pb={0}>
          {item.label}
          <Icon
            as={HiOutlineLink}
            cursor="pointer"
            fontSize="xl"
            onClick={handleShareButtonClick}
            ml={1}
            transition="0.2s"
            _hover={{
              color: 'rw.900',
            }}
          />
        </ModalHeader>
        <ModalCloseButton size="lg" backgroundColor="rgba(160,174,192,0.4)" />
        <ModalBody className={styles.modalContent}>
          <Flex justifyContent="space-between">
            <CategoryTag mb={4} colorHex={item.category.color}>
              {item.category.label}
            </CategoryTag>
          </Flex>
          <br />

          {item.website && (
            <HStack alignItems="flex-start">
              <Text color="gray.700" fontWeight="600">
                Website:
              </Text>
              <Link
                color="blue.400"
                href={listingWebsite}
                rel="noreferrer"
                target="_blank"
                display="flex"
                alignItems="center"
                gap="0.125rem"
              >
                <span>{websiteSanitized}</span>
                <HiExternalLink />
              </Link>
            </HStack>
          )}

          {isMobile && (
            <HStack justifyContent="space-between" mt={4}>
              {socialLinks}
            </HStack>
          )}

          <Box mt={4} mb={8}>
            <DescriptionRichText html={item.description} />
          </Box>

          <Box
            mt={4}
            display="flex"
            justifyContent="flex-end"
            flexWrap="wrap"
            gap="0.25rem"
          >
            {item.tags?.map((tag) => {
              const urlEncodedTag = tag.label.replace(' ', '+')
              return (
                <NextLink
                  key={tag.id}
                  href={`${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}?web=${webSearchParam}&tags=${urlEncodedTag}`}
                  onClick={onClose}
                >
                  <Tag
                    backgroundColor={tag.color ?? 'gray.300'}
                    userSelect="none"
                    _hover={{ opacity: 0.8 }}
                  >
                    #{tag.label}
                  </Tag>
                </NextLink>
              )
            })}
          </Box>
        </ModalBody>

        {!isMobile && (
          <ModalFooter justifyContent="space-between" py={4}>
            {socialLinks}

            <Link as={NextLink} href={individualListingLink}>
              <Button mt={2} variant="rw">
                Go to listing
              </Button>
            </Link>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  )
}

export default memo(Dialog)
