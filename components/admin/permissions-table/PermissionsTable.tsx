import { memo } from 'react'
import {
  Badge,
  Text,
  Stack,
  TableContainer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'

const columns = [
  {
    Header: 'Email',
    accessor: 'email',
  },
  {
    Header: 'Permissions',
    accessor: 'webs',
  },
]

const PermissionsTable = ({ permissions }) => {
  const { data: session } = useSession()

  return (
    <TableContainer
      borderRadius="10px"
      borderStyle="solid"
      borderWidth="1px"
      mb="2rem"
    >
      <Table fontSize="sm" background="#ffffff">
        <Thead bg="gray.50">
          <Tr>
            {columns.map((column, index) => (
              <Th whiteSpace="nowrap" scope="col" key={index}>
                {column.Header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {permissions.map((permission) => (
            <Tr key={permission.id}>
              {columns.map((column, index) => {
                if (column.accessor === 'email') {
                  const emailAddress = permission.email
                  const name = permission.user.name
                  return (
                    <Td key={index}>
                      <VStack
                        justifyContent="flex-start"
                        alignItems="flex-start"
                      >
                        <Text fontWeight="600">{name}</Text>
                        <Text>
                          {emailAddress}
                          {session.user.email === emailAddress && ' (You)'}
                        </Text>
                      </VStack>
                    </Td>
                  )
                }

                if (column.accessor === 'webs') {
                  if (permission.owner === true) {
                    return (
                      <Td key={index}>
                        <Badge>Owner</Badge>
                      </Td>
                    )
                  }

                  return (
                    <Td key={index}>
                      <Stack direction="row">
                        <Badge>Editor</Badge>
                        {!permission.user.emailVerified && (
                          <Badge colorScheme="yellow">Invite pending</Badge>
                        )}
                      </Stack>
                    </Td>
                  )
                }
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export default memo(PermissionsTable)
