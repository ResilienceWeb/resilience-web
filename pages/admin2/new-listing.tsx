import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { Flex, Box, Stack, Button, Spinner } from '@chakra-ui/react'
import { HiArrowLeft } from 'react-icons/hi'
import { useCreateListing } from '@hooks/listings'
import { useCategories } from '@hooks/categories'
import LayoutContainer from '@components/admin/layout-container'
import ListingForm from '@components/admin/listing-form'
import { useAppContext } from '@store/hooks'

export default function NewListing() {
  const router = useRouter()
  const { categories } = useCategories()
  const { mutate: createListing } = useCreateListing()
  const { selectedWebId } = useAppContext()

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  const handleSubmit = useCallback(
    (data) => {
      data.webId = selectedWebId
      data.pending = false
      createListing(data)
      goBack()
    },
    [createListing, goBack, selectedWebId],
  )

  if (!categories) {
    return (
      <Flex height="100vh" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Flex>
    )
  }

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
        <Button
          leftIcon={<HiArrowLeft />}
          name="Back"
          mb={2}
          ml={2}
          onClick={goBack}
          variant="link"
          color="gray.700"
        >
          Back
        </Button>

        <Box
          mt={4}
          shadow="base"
          rounded={[null, 'md']}
          overflow={{ sm: 'hidden' }}
        >
          <Stack bg="white" spacing={6}>
            <ListingForm categories={categories} handleSubmit={handleSubmit} />
          </Stack>
        </Box>
      </Box>
    </LayoutContainer>
  )
}
