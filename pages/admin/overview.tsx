import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
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
import { useSession } from 'next-auth/react'
import LayoutContainer from '@components/admin/layout-container'
import { useWebs } from '@hooks/webs'

export default function Overview() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const { isPending: isLoadingWebs, webs } = useWebs({ withAdminInfo: true })

  if (sessionStatus === 'loading' || isLoadingWebs) {
    return (
      <LayoutContainer>
        <Center height="100%">
          <Spinner size="xl" />
        </Center>
      </LayoutContainer>
    )
  }

  if (!session || !session.user.admin) return null

  return (
    <>
      <NextSeo
        title="Admin | Resilience Web"
        openGraph={{
          title: 'Admin | Resilience Web',
        }}
      />
      <LayoutContainer>
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
      </LayoutContainer>
    </>
  )
}

export const columns = [
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
