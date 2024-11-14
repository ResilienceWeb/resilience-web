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
  IconButton,
} from '@chakra-ui/react'
import { PiWarningCircleBold } from 'react-icons/pi'
import { FaStar, FaRegStar } from 'react-icons/fa'
import useFeatureListing from '@hooks/listings/useFeatureListing'

import CategoryTag from '@components/category-tag'

const TableContent = ({ goToEdit, goToProposedEdits, items, removeItem }) => {
  const { featureListing, unfeatureListing } = useFeatureListing()
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
            <Th>Featured</Th>
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

              <Td>
                <Tooltip
                  borderRadius="md"
                  label="Display this listing at the top of the web page for 7 days."
                >
                  <IconButton
                    aria-label="Toggle featured"
                    icon={
                      item.featured ? <FaStar color="green" /> : <FaRegStar />
                    }
                    colorScheme="gray"
                    size="md"
                    fontSize="20px"
                    isRound={true}
                    onClick={() => {
                      if (item.featured) {
                        unfeatureListing(item.id)
                      } else {
                        featureListing(item.id)
                      }
                    }}
                  />
                </Tooltip>
              </Td>

              <Td position="sticky" right={0} background="gray.100">
                <Stack direction="column" spacing={2}>
                  {item.edits?.length > 0 && (
                    <Button
                      colorScheme="purple"
                      onClick={() => goToProposedEdits(item)}
                      size="sm"
                    >
                      View suggested edit
                    </Button>
                  )}
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
    Cell: function CategoryCell(category) {
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
