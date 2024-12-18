import { memo } from 'react'
import { Box } from '@chakra-ui/react'
import TableContent from './TableContent'

const Table = ({ goToEdit, goToProposedEdits, items, removeItem }) => {
  return (
    <Box as="section" py="1rem" overflowX="auto">
      <TableContent
        goToEdit={goToEdit}
        goToProposedEdits={goToProposedEdits}
        items={items}
        removeItem={removeItem}
      />
    </Box>
  )
}

export default memo(Table)
