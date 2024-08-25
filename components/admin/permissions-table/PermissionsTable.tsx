import { memo } from 'react'
import {
  Badge,
  Stack,
  TableContainer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
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
                const cell = permission[column.accessor]

                if (column.accessor === 'email') {
                  return (
                    <Td key={index}>
                      {cell}
                      {session.user.email === cell && ' (You)'}
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
