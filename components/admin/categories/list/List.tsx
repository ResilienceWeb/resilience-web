import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { memo } from 'react'

import CategoryTag from '@components/category-tag'

const columns = [
    {
        Header: 'Category label',
        accessor: 'label',
    },
    {
        Header: 'Color',
        accessor: 'color',
    },
]

const List = ({ categories }) => {
    if (!categories) {
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
                {categories.map((row) => (
                    <Tr key={row.id}>
                        {columns.map((column, index) => {
                            const cell = row[column.accessor]

                            if (column.accessor === 'color') {
                                return (
                                    <Td key={index} width="100px">
                                        <CategoryTag mb={4} colorHex={cell}>
                                            {`#${cell}`}
                                        </CategoryTag>
                                    </Td>
                                )
                            }

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

