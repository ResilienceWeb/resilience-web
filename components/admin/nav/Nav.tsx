import { useCallback } from 'react'
import NextLink from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import {
  Box,
  Flex,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Text,
} from '@chakra-ui/react'
import { FiMenu } from 'react-icons/fi'
import { BsPersonCircle } from 'react-icons/bs'
import GetInTouchButton from '@components/feedback-dialog/GetInTouchButton'

import WebSelector from './web-selector'

const Nav = ({ onOpen }) => {
  const { data: session } = useSession()

  const handleSignOut = useCallback(() => {
    signOut()
  }, [])

  return (
    <Box
      bg="#fafafa"
      px={4}
      borderBottom={1}
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
      flex="1"
      maxWidth="100vw"
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <IconButton
          variant="outline"
          onClick={onOpen}
          aria-label="open menu"
          icon={<FiMenu />}
          display={{ base: 'inherit', lg: 'none' }}
          mr="1rem"
        />
        <Flex alignItems="center" justifyContent="space-between" width="100%">
          <Box mr="1rem">
            <WebSelector />
          </Box>
          <Flex gap="1rem">
            <GetInTouchButton />
            <Menu>
              <MenuButton
                as={Button}
                colorScheme="gray"
                rounded="full"
                variant="link"
                cursor="pointer"
              >
                <BsPersonCircle size="32" />
              </MenuButton>
              <MenuList zIndex={5}>
                {session?.user.email && (
                  <>
                    <MenuItem isDisabled color="gray.600">
                      <Text fontSize="0.75rem">
                        Signed in as {session?.user.email}
                      </Text>
                    </MenuItem>
                    <MenuItem as={NextLink} href="/admin/user-settings">
                      <Text fontSize="1rem">User settings</Text>
                    </MenuItem>
                    <MenuDivider />
                  </>
                )}
                <MenuItem onClick={handleSignOut} fontSize={'15px'}>
                  Sign out
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Nav
