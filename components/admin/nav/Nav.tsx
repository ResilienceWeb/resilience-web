import { useCallback } from 'react'
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
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
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
                    <Text fontSize="14px">
                      Signed in as {session?.user.email}
                    </Text>
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
    </Box>
  )
}

export default Nav
