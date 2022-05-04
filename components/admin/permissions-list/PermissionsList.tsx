import { memo, useEffect, useMemo, useState } from 'react'
import { Table, Tbody, Td, Th, Thead, Tr, Tag } from '@chakra-ui/react'
import chroma from 'chroma-js'

const columns = [
    {
        Header: 'User email',
        accessor: 'email',
    },
    {
        Header: 'Listing',
        accessor: 'listing',
    },
    {
        Header: 'Account created?',
        accessor: 'accountCreated',
    },
]

export async function fetchUser(email) {
    const response = await fetch(`/api/users/${email}`)
    const data = await response.json()
    const { user } = data
    return user
}

const PermissionsList = ({ permissions }) => {
    const [userRegistrationsMap, setUserRegistrationsMap] = useState({})

    useEffect(() => {
        async function fetchData() {
            const userRegistrationsResult = {}
            await Promise.allSettled(
                permissions.map(async (p) => {
                    const isUserRegistered = await fetchUser(p.email)
                    userRegistrationsResult[p.email] = Boolean(isUserRegistered)
                }),
            )
            setUserRegistrationsMap(userRegistrationsResult)
        }
        void fetchData()
    }, [permissions])

    const permissionsForDisplay = useMemo(() => {
        if (!permissions || !Object.keys(userRegistrationsMap).length) return []

        const result = permissions.map((p) => {
            return {
                email: p.email,
                listing: p.listing.title,
                accountCreated: userRegistrationsMap[p.email] ? 'Yes' : 'No',
            }
        })

        return result
    }, [permissions, userRegistrationsMap])

    if (!permissionsForDisplay) return null

    return (
        <Table my="8" borderWidth="1px" fontSize="sm" background="#ffffff">
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
                {permissionsForDisplay.map((row, index) => (
                    <Tr key={index}>
                        {columns.map((column, index) => {
                            const cell = row[column.accessor]

                            if (column.accessor === 'accountCreated') {
                                return (
                                    <Td key={index} width="100px">
                                        <Tag
                                            backgroundColor={
                                                cell === 'Yes'
                                                    ? chroma('green')
                                                          .alpha(0.5)
                                                          .css()
                                                    : chroma('gray')
                                                          .alpha(0.5)
                                                          .css()
                                            }
                                        >
                                            {cell}
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

export default memo(PermissionsList)
