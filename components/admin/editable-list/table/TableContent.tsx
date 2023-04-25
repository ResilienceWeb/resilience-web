import { memo } from 'react'
import {
  Button,
  Badge,
  Tooltip,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Stack,
  useColorModeValue as mode,
} from '@chakra-ui/react'

import CategoryTag from '@components/category-tag'

const TableContent = ({ goToEdit, items, removeItem }) => {
  if (!items) return null

  return (
    <Table my="8" borderWidth="1px" fontSize="sm" background="#ffffff">
      <Thead bg={mode('gray.50', 'gray.800')}>
        <Tr>
          {columns.map((column, index) => (
            <Th whiteSpace="nowrap" scope="col" key={index}>
              {column.Header}
            </Th>
          ))}
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        {items.map((row, index) => (
          <Tr key={index}>
            {columns.map((column, index) => {
              const cell = row[column.accessor]
              const element = column.Cell?.(cell) ?? cell
              return (
                <Td key={index} maxWidth="100px">
                  {element}
                </Td>
              )
            })}
            <Td textAlign="right" maxWidth="80px">
              <Stack direction="column" spacing={2}>
                <Button
                  colorScheme={row.pending ? 'purple' : 'blue'}
                  onClick={() => goToEdit(row)}
                  size="sm"
                >
                  {row.pending ? 'Review' : 'Edit'}
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => removeItem(row.id)}
                  size="sm"
                >
                  Remove
                </Button>
              </Stack>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}

export const columns = [
  {
    Header: 'Title',
    accessor: 'title',
  },
  {
    Header: 'Category',
    accessor: 'category',
    Cell: function StatusCell(category) {
      if (!category || !category.color) return null
      return (
        <CategoryTag fontSize="xs" colorHex={category.color}>
          {category.label}
        </CategoryTag>
      )
    },
  },
  {
    Header: '',
    accessor: 'pending',
    Cell: function PendingCell(isPending) {
      if (isPending) {
        return (
          <Tooltip
            borderRadius="md"
            label="This was submitted via the external form and needs to be reviewed. It is currently not published."
          >
            <Badge colorScheme="purple" fontSize="1.25rem" padding="0.25rem">
              Pending
            </Badge>
          </Tooltip>
        )
      }
    },
  },
]

export default memo(TableContent)
