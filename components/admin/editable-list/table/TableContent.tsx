import { memo } from 'react'
import {
  Flex,
  Button,
  Badge,
  Tooltip,
  TableContainer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Stack,
  Tag,
  TagLeftIcon,
  TagLabel,
} from '@chakra-ui/react'
import { PiWarningCircleBold } from 'react-icons/pi'

import CategoryTag from '@components/category-tag'

const TableContent = ({ goToEdit, items, removeItem }) => {
  if (!items) return null

  return (
    <TableContainer borderRadius="10px" borderStyle="solid" borderWidth="1px">
      <Table fontSize="sm">
        <Thead bg="gray.50">
          <Tr>
            {columns.map((column, index) => (
              <Th whiteSpace="nowrap" scope="col" key={index}>
                {column.Header}
              </Th>
            ))}
            <Th>Info</Th>
            <Th position="sticky" right={0} bg="gray.100"></Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((item, index) => (
            <Tr key={index}>
              {columns.map((column, index) => {
                const cell = item[column.accessor]
                const element = column.Cell?.(cell) ?? cell
                return <Td key={index}>{element}</Td>
              })}

              <Td>
                Created on{' '}
                <b>
                  {Intl.DateTimeFormat('en-GB', {
                    dateStyle: 'long',
                  }).format(new Date(item.createdAt))}
                </b>
                <br />
                Last updated on{' '}
                <b>
                  {Intl.DateTimeFormat('en-GB', {
                    dateStyle: 'long',
                  }).format(new Date(item.updatedAt))}
                </b>
                <br />
                <Flex mt="0.5rem" flexWrap="wrap" gap="0.25rem">
                  {!item.image && (
                    <Tag>
                      <TagLeftIcon boxSize="18px" as={PiWarningCircleBold} />
                      <TagLabel>No image</TagLabel>
                    </Tag>
                  )}
                  {item.description.length < 50 && (
                    <Tag>
                      <TagLeftIcon boxSize="18px" as={PiWarningCircleBold} />
                      <TagLabel>Short description</TagLabel>
                    </Tag>
                  )}
                </Flex>
              </Td>

              <Td position="sticky" right={0} background="gray.100">
                <Stack direction="column" spacing={2}>
                  <Button
                    colorScheme={item.pending ? 'purple' : 'blue'}
                    onClick={() => goToEdit(item)}
                    size="sm"
                  >
                    {item.pending ? 'Review' : 'Edit'}
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => removeItem(item.slug)}
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
    </TableContainer>
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
