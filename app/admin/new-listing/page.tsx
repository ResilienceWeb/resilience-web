'use client'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { Center, Box, Stack, Button, Spinner } from '@chakra-ui/react'
import { HiArrowLeft } from 'react-icons/hi'
import useCreateListing from '@hooks/listings/useCreateListing'
import useCategories from '@hooks/categories/useCategories'
import ListingForm from '@components/admin/listing-form'
import { useAppContext } from '@store/hooks'

export default function NewListingPage() {
  const router = useRouter()
  const { categories, isPending: isCategoriesPending } = useCategories()
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

  if (!categories || isCategoriesPending) {
    return (
      <Center height="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Box
      px={{
        base: 0,
        md: '10',
      }}
      py={4}
      maxWidth="5xl"
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
  )
}
