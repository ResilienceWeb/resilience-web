import { memo, useEffect } from 'react'
import { Formik, Form, Field, FieldProps, useFormikContext } from 'formik'
import { Category } from '@prisma/client'
import {
  chakra,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  HStack,
  Text,
  Tooltip,
  Heading,
  Stack,
  Flex,
} from '@chakra-ui/react'
import { emailValidator, fieldRequiredValidator } from '@helpers/formValidation'
import Diff from './Diff'

import EditorField from '../RichTextEditor'

interface Props {
  listing: Listing
  editedListing: Listing
  categories: Category[]
  handleSubmit: (data: any) => void
}

// function compareStrings(string1, string2) {
//   const results = Diff.diffChars(string1, string2)

//   console.log(results)

//   let output = ''
//   results.forEach((item) => {
//     if (item.removed) {
//       output += `<span style="background-color:yellow">${item.value}</span>`
//     } else if (!item.added) {
//       output += `${item.value}`
//     }
//   })

//   return output
// }

const ListingEditReview = ({
  listing,
  editedListing,
  categories,
  handleSubmit,
}: Props) => {
  // const diffstring = compareStrings(listing.title, editedListing.title)
  // console.log(listing.title, editedListing.title, diffstring)

  return (
    <Stack bg="white" spacing={6}>
      <Diff
        label="Title"
        string1={listing.title}
        string2={editedListing.title}
      />

      <Diff
        label="Description"
        string1={listing.description}
        string2={editedListing.description}
      />

      <Diff
        label="Contact email for organisation"
        string1={listing.email}
        string2={editedListing.email}
      />

      <Diff
        label="Website"
        string1={listing.website}
        string2={editedListing.website}
      />

      <Diff
        label="Facebook"
        string1={listing.facebook}
        string2={editedListing.facebook}
      />

      <Diff
        label="Twitter"
        string1={listing.twitter}
        string2={editedListing.twitter}
      />

      <Diff
        label="Instagram"
        string1={listing.instagram}
        string2={editedListing.instagram}
      />

      <Flex justifyContent="flex-end" gap="1rem">
        <Button colorScheme="red">Reject</Button>
        <Button
          // isDisabled={!props.isValid || !props.dirty}
          // isLoading={props.isSubmitting}
          size="md"
          variant="rw"
          onClick={handleSubmit}
        >
          Accept changes
        </Button>
      </Flex>
    </Stack>
  )
}

export default memo(ListingEditReview)
