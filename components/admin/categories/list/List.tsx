import { Table, Tbody, Td, Th, Thead, Tr, Tag } from '@chakra-ui/react'
import chroma from 'chroma-js'
import { memo, useMemo } from 'react'

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
                                        <Tag
                                            backgroundColor={chroma(cell)
                                                .alpha(0.5)
                                                .css()}
                                        >
                                            {`#${cell}`}
                                        </Tag>
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

