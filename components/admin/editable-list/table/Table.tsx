import { memo } from 'react'
import { Box } from '@chakra-ui/react'
import TableContent from './TableContent'

const Table = ({ goToEdit, items, removeItem }) => {
  return (
    <Box as="section" py={6}>
      <Box overflowX="auto">
        <TableContent
          goToEdit={goToEdit}
          items={items}
          removeItem={removeItem}
        />
      </Box>
    </Box>
  )
}

export default memo(Table)
