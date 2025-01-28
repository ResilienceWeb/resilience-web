import { memo } from 'react'
import TableContent from './TableContent'

const Table = ({ goToEdit, goToProposedEdits, items, removeItem }) => {
  return (
    <section className="w-full overflow-x-auto py-4">
      <TableContent
        goToEdit={goToEdit}
        goToProposedEdits={goToProposedEdits}
        items={items}
        removeItem={removeItem}
      />
    </section>
  )
}

export default memo(Table)
