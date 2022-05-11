import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Box, Stack, StackDivider, Heading, Spinner } from '@chakra-ui/react'
import LayoutContainer from '@components/admin/layout-container'
import { useCategories } from '@hooks/categories'
import CategoriesHeader from '@components/admin/categories/header'
import CategoriesList from '@components/admin/categories/list'

export default function Categories() {
    const { data: session, status: sessionStatus } = useSession()
    const { categories, isLoading: isLoadingCategories } = useCategories()

    const orderedCategories = useMemo(() => {
        return categories?.sort((a, b) => a.label.localeCompare(b.label))
    }, [categories])

    if (sessionStatus === 'loading' || isLoadingCategories) {
        return (
            <LayoutContainer>
                <Spinner size="xl" />
            </LayoutContainer>
        )
    }

    if (!session || !session.user.admin) return null

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
                    <Box mt={6}>
                        <CategoriesHeader />
                        <CategoriesList categories={orderedCategories} />
                    </Box>
                </Stack>
            </Box>
        </LayoutContainer>
    )
}

