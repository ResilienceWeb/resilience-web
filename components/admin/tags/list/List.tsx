import {
  TableContainer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Stack,
  Button,
  useDisclosure,
} from '@chakra-ui/react'
import { memo, useCallback, useState } from 'react'

import useUpdateTag from '@hooks/tags/useUpdateTag'
import useDeleteTag from '@hooks/tags/useDeleteTag'
import { UpdateTagDialog } from '../header/tag-dialog'

const columns = [
  {
    Header: 'Tag label',
    accessor: 'label',
  },
  {
    Header: 'Number of listings',
    accessor: 'listings',
  },
]

const List = ({ tags }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { mutate: updateTag } = useUpdateTag()
  const { mutate: deleteTag } = useDeleteTag()

  const [selectedTagId, setSelectedTagId] = useState(null)
  const selectedTag = tags.find((tag) => tag.id === selectedTagId)

  const handleOpen = (tagId) => {
    setSelectedTagId(tagId)
    onOpen()
  }

  const handleSubmit = useCallback(
    (data) => {
      onClose()
      updateTag({
        ...data,
        id: selectedTagId,
      })
    },
    [onClose, updateTag, selectedTagId],
  )

  const handleDelete = useCallback(() => {
    onClose()
    deleteTag({ id: selectedTagId })
  }, [deleteTag, onClose, selectedTagId])

  if (!tags) {
    return null
  }

  return (
    <>
      <TableContainer borderRadius="10px" borderStyle="solid" borderWidth="1px">
        <Table fontSize="sm" background="#ffffff">
          <Thead bg={'gray.50'}>
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
            {tags.map((row) => (
              <Tr key={row.id}>
                {columns.map((column, index) => {
                  const cell = row[column.accessor]

                  if (column.accessor === 'listings') {
                    return (
                      <Td key={index}>
                        <strong>{cell.length}</strong>
                      </Td>
                    )
                  }

                  return (
                    <Td key={index} maxWidth="100px">
                      {cell}
                    </Td>
                  )
                })}
                <Td textAlign="right" maxWidth="80px">
                  <Stack direction="column" spacing={2}>
                    <Button
                      colorScheme="blue"
                      onClick={() => handleOpen(row.id)}
                      size="sm"
                    >
                      Edit
                    </Button>
                  </Stack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <UpdateTagDialog
        tag={selectedTag}
        isOpen={isOpen}
        onClose={onClose}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
      />
    </>
  )
}

export default memo(List)
