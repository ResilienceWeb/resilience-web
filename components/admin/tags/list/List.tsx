import {
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

import { useUpdateTag } from '@hooks/tags'
import { UpdateTagDialog } from '../header/tag-dialog'

const columns = [
  {
    Header: 'Tag label',
    accessor: 'label',
  },
]

const List = ({ tags }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { mutate: updateTag } = useUpdateTag()

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

  if (!tags) {
    return null
  }

  return (
    <>
      <Table borderWidth="1px" fontSize="sm" background="#ffffff" mb={'2rem'}>
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
      <UpdateTagDialog
        tag={selectedTag}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
      />
    </>
  )
}

export default memo(List)
