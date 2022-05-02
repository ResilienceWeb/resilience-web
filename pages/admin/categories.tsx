import { useSession } from 'next-auth/react'
import { Box, Stack, StackDivider, Heading } from '@chakra-ui/react'
import LayoutContainer from '@components/admin/layout-container'
import { useCategories } from '@hooks/categories'
import CategoriesList from '@components/admin/categories-list'

export default function Categories() {
    const { data: session, status: sessionStatus } = useSession()
    const { categories } = useCategories()

    return (
        <LayoutContainer>
            <Box
                px={{
                    base: '4',
                    md: '10',
                }}
                py={4}
                maxWidth="3xl"
                mx="auto"
            >
                <Stack spacing="4" divider={<StackDivider />}>
                    <Heading>Edit categories</Heading>
                    <Box mt={6} maxW="400px">
                        <CategoriesList categories={categories} />
                    </Box>
                </Stack>
            </Box>
        </LayoutContainer>
    )
}

