import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { memo } from 'react'

const columns = [
    {
        Header: 'Tag label',
        accessor: 'label',
    },
]

const List = ({ tags }) => {
    if (!tags) {
        return null
    }

    return (
        <Table borderWidth="1px" fontSize="sm" background="#ffffff" mb={'2rem'}>
            <Thead bg={'gray.50'}>
                <Tr>
                    {columns.map((column, index) => (
                        <Th whiteSpace="nowrap" scope="col" key={index}>
                            {column.Header}
                        </Th>
                    ))}
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
                    </Tr>
                ))}
            </Tbody>
        </Table>
    )
}

export default memo(List)

