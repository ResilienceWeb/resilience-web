import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import NextLink from 'next/link'
import Image from 'next/legacy/image'
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
  chakra,
  Flex,
  Tooltip,
  Text,
  Button,
  useToast,
  Tag,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { SiFacebook, SiInstagram, SiTwitter } from 'react-icons/si'
import { HiUserGroup, HiShare } from 'react-icons/hi'
import { GiNightSleep } from 'react-icons/gi'
import { sanitizeLink } from '@helpers/utils'
import { REMOTE_HOSTNAME, PROTOCOL } from '@helpers/config'
import DescriptionRichText from '@components/main-list/description-rich-text'
import CategoryTag from '@components/category-tag'

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
        'The link to this listing is now in your clipboard and ready to be shared.',
      status: 'info',
      duration: 4000,
    })
  }, [toast])

  useEffect(() => {
    const hostname = window.location.hostname
    if (!hostname.includes('.')) {
      return null
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
        {item.twitter && (
          <Link href={item.twitter} target="_blank">
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
        {item.instagram && (
          <Link href={item.instagram} target="_blank">
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
      {item.seekingVolunteers && (
        <Flex justifyContent={'right'}>
          <Tooltip label="This group is seeking volunteers or members. Get in touch with them if you'd like to help.">
            <Text color="seagreen">
              Seeking volunteers <Icon as={HiUserGroup} />
            </Text>
          </Tooltip>
        </Flex>
      )}
      {item.inactive && (
        <Flex justifyContent={'right'}>
          <Tooltip label="This group is currently inactive.">
            <Text color="grey">
              Currently inactive <Icon as={GiNightSleep} />
            </Text>
          </Tooltip>
        </Flex>
      )}
    </>
  )

  return (
    <Modal
      isCentered={!isMobile}
      isOpen={isOpen}
      onClose={onClose}
      size={isMobile ? 'full' : '2xl'}
    >
      <ModalOverlay />
      <ModalContent opacity="1">
        {item.image && (
          <Image
            alt={`${item.label} cover image`}
            src={item.image}
            objectFit="cover"
            width="672"
            height="300"
            unoptimized
            style={{
              borderTopLeftRadius: '0.375rem',
              borderTopRightRadius: '0.375rem',
            }}
          />
        )}

        <ModalHeader pb={0}>{item.label}</ModalHeader>
        <ModalCloseButton size="lg" backgroundColor="rgba(160,174,192,0.4)" />
        <ModalBody>
          <Flex justifyContent="space-between">
            <CategoryTag mb={4} colorHex={item.category.color}>
              {item.category.label}
            </CategoryTag>
            <Icon
              as={HiShare}
              cursor="pointer"
              fontSize="3xl"
              onClick={handleShareButtonClick}
            />
          </Flex>
          <br />

          {item.website && (
            <chakra.a
              color="blue.400"
              href={item.website}
              rel="noreferrer"
              target="_blank"
              verticalAlign="text-bottom"
            >
              {websiteSanitized} <ExternalLinkIcon ml={1} />
            </chakra.a>
          )}

          {isMobile && (
            <HStack justifyContent="space-between" mt={4}>
              {socialLinks}
            </HStack>
          )}

          <Box mt={4} mb={8}>
            <DescriptionRichText html={item.description} />
          </Box>
          <Link as={NextLink} href={individualListingLink}>
            <Button
              bg="rw.700"
              colorScheme="rw.700"
              mt={2}
              variant="solid"
              _hover={{ bg: 'rw.900' }}
            >
              See more
            </Button>
          </Link>

          <Box mt={4} display="flex" justifyContent="flex-end">
            {item.tags.map((tag) => (
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
        </ModalBody>

        {!isMobile && (
          <ModalFooter justifyContent="space-between" py={2}>
            {socialLinks}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  )
}

export default memo(Dialog)
