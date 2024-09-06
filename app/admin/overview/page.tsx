'use client'
import { useRouter } from 'next/navigation'
import {
  Heading,
  Badge,
  Center,
  Spinner,
  TableContainer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import useWebs from '@hooks/webs/useWebs'

const columns = [
  {
    Header: 'Web title',
    accessor: 'title',
  },
  {
    Header: 'Status',
  },
  {
    Header: 'Details',
  },
]

export default function OverviewPage() {
  const router = useRouter()
  const { isPending: isLoadingWebs, webs } = useWebs({ withAdminInfo: true })

  if (isLoadingWebs) {
    return (
      <Center height="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <>
      <Heading mb="1.5rem">Overview</Heading>
      <TableContainer
        borderRadius="10px"
        borderStyle="solid"
        borderWidth="1px"
        mb="2rem"
      >
        <Table fontSize="sm" background="#ffffff">
          <Thead bg="gray.50">
            <Tr>
              {columns.map((column, index) => (
                <Th whiteSpace="nowrap" scope="col" key={index}>
                  {column.Header}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {webs
              .sort(
                (web1, web2) =>
                  new Date(web2.createdAt).valueOf() -
                  new Date(web1.createdAt).valueOf(),
              )
              .map((web) => {
                const teamMembersCount =
                  web.ownerships.length + web.permissions.length

                return (
                  <Tr
                    key={web.id}
                    onClick={() => {
                      router.push(`/admin/overview/${web.slug}`)
                    }}
                    cursor="pointer"
                    _hover={{
                      bg: 'gray.100',
                    }}
                  >
                    <Td>{web.title}</Td>
                    <Td>
                      {web.published ? (
                        <Badge colorScheme="green">Published</Badge>
                      ) : (
                        <Badge>Private</Badge>
                      )}
                    </Td>
                    <Td>
                      <p>
                        <strong>{web.listings.length}</strong> listings
                      </p>
                      <p>
                        <strong>{teamMembersCount}</strong>{' '}
                        {teamMembersCount === 1
                          ? 'team member'
                          : 'team members'}
                      </p>
                    </Td>
                  </Tr>
                )
              })}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  )
}
