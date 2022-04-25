import { memo, useCallback, useMemo } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Box,
    Tag,
    Icon,
    HStack,
    Link,
    chakra,
    Flex,
    Tooltip,
    Text,
    Image,
    useToast,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { SiFacebook, SiInstagram, SiTwitter } from 'react-icons/si'
import { HiUserGroup, HiShare } from 'react-icons/hi'
import { GiNightSleep } from 'react-icons/gi'
import { sanitizeLink } from '@helpers/utils'
import { REMOTE_URL } from '@helpers/config'
import DescriptionRichText from '@components/main-list/description-rich-text'

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

    const handleShareButtonClick = useCallback(async () => {
        await navigator.clipboard.writeText(`${REMOTE_URL}/city/${item.slug}`)
        showCopiedToClipboardToast()
    }, [item.slug, showCopiedToClipboardToast])

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
            size={isMobile ? 'full' : 'xl'}
        >
            <ModalOverlay />
            <ModalContent opacity="1">
                {item.image && (
                    <Image
                        alt={`${item.label} cover image`}
                        src={item.image}
                        objectFit="cover"
                        width="100%"
                        maxHeight="300px"
                        borderTopRadius="0.375rem"
                    />
                )}

                <ModalHeader pb={0}>{item.label}</ModalHeader>
                <ModalCloseButton
                    size="lg"
                    backgroundColor="rgba(160,174,192,0.4)"
                />
                <ModalBody>
                    <Flex justifyContent="space-between">
                        <Tag
                            mb={4}
                            backgroundColor={item.color}
                            userSelect="none"
                        >
                            {item.category}
                        </Tag>
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
                </ModalBody>

                {!isMobile && (
                    <ModalFooter justifyContent="space-between">
                        {socialLinks}
                    </ModalFooter>
                )}
            </ModalContent>
        </Modal>
    )
}

export default memo(Dialog)
