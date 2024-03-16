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

                return <Td key={index}>{cell}</Td>
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export default memo(PermissionsTable)
