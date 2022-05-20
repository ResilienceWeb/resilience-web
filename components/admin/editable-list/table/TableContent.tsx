import { memo } from 'react'
import chroma from 'chroma-js'
import {
    Button,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Stack,
    Tag,
    useColorModeValue as mode,
} from '@chakra-ui/react'

const TableContent = ({ goToEdit, items, removeItem }) => {
    if (!items) return null

    return (
        <Table my="8" borderWidth="1px" fontSize="sm" background="#ffffff">
            <Thead bg={mode('gray.50', 'gray.800')}>
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
                {items.map((row, index) => (
                    <Tr key={index}>
                        {columns.map((column, index) => {
                            const cell = row[column.accessor]
                            const element = column.Cell?.(cell) ?? cell
                            return (
                                <Td key={index} maxWidth="100px">
                                    {element}
                                </Td>
                            )
                        })}
                        <Td textAlign="right" maxWidth="80px">
                            <Stack direction="column" spacing={2}>
                                <Button
                                    colorScheme="blue"
                                    onClick={() => goToEdit(row)}
                                    size="sm"
                                >
                                    Edit
                                </Button>
                                <Button
                                    colorScheme="red"
                                    onClick={() => removeItem(row.id)}
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
            const color = chroma(`#${category.color}`)
            return (
                <Tag fontSize="xs" backgroundColor={color.alpha(0.5).css()}>
                    {category.label}
                </Tag>
            )
        },
    },
    {
        Header: 'Website',
        accessor: 'website',
    },
    {
        Header: 'Email',
        accessor: 'email',
    },
]

export default memo(TableContent)
