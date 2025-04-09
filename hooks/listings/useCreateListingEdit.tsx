import { useMutation } from '@tanstack/react-query'

async function createListingEditRequest(listingData) {
  const formData = new FormData()
  Object.keys(listingData).forEach((key) => {
    if (key === 'socials') {
      formData.append(key, JSON.stringify(listingData[key]))
    } else if (key === 'image') {
      if (listingData[key] === null) {
        formData.append(key, 'null')
      } else {
        formData.append(key, listingData[key])
      }
    } else {
      formData.append(key, listingData[key])
    }
  })

  const response = await fetch(`/api/listings/${listingData.slug}/edit`, {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  const { listing } = data
  return listing
}

export default function useUpdateListing() {
  return useMutation({
    mutationFn: createListingEditRequest,
  })
}
