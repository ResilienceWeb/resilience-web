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
  const handleSubmitForm = (data) => {
    data.tags = data.tags?.map((t) => t.value)
    data.relations = data.relations?.map((l) => l.value)
    handleSubmit(data)
  }

  // const diffstring = compareStrings(listing.title, editedListing.title)
  // console.log(listing.title, editedListing.title, diffstring)

  return (
    <>
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
      </Stack>
      <Formik
        initialValues={{
          id: listing?.id || null,
          title: listing?.title ?? '',
          description: listing?.description || '',
          category: listing?.categoryId || undefined,
          email: listing?.email || '',
          website: listing?.website || '',
          facebook: listing?.facebook || '',
          twitter: listing?.twitter || '',
          instagram: listing?.instagram || '',
          seekingVolunteers: listing?.seekingVolunteers || false,
          image: listing?.image,
        }}
        enableReinitialize
        onSubmit={handleSubmitForm}
      >
        {(props) => {
          return (
            <Form encType="multipart/form-data">
              <chakra.div p={{ sm: 6 }} px={4} py={5}>
                <chakra.div mb={3}>
                  <Field name="title" validate={fieldRequiredValidator}>
                    {({ field, form }: FieldProps) => (
                      <FormControl
                        isInvalid={Boolean(
                          form.errors.title && form.touched.title,
                        )}
                      >
                        <FormLabel
                          htmlFor="title"
                          fontSize="sm"
                          fontWeight="600"
                        >
                          Title*
                        </FormLabel>
                        <Input
                          {...field}
                          id="title"
                          fontSize="sm"
                          shadow="sm"
                          size="sm"
                          rounded="md"
                        />
                        <FormErrorMessage>
                          {form.errors.title?.toString()}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </chakra.div>

                <chakra.div mb={3}>
                  <Field name="category" validate={fieldRequiredValidator}>
                    {({ field, form }: FieldProps) => (
                      <FormControl
                        isInvalid={Boolean(
                          form.errors.category && form.touched.category,
                        )}
                      >
                        <FormLabel
                          htmlFor="category"
                          fontSize="sm"
                          fontWeight="600"
                        >
                          Category*
                        </FormLabel>
                        <Select
                          {...field}
                          fontSize="sm"
                          shadow="sm"
                          size="sm"
                          rounded="md"
                          placeholder="Select a category"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>
                          Please select a category
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </chakra.div>

                <chakra.div mb={3}>
                  <Field
                    name="description"
                    validate={fieldRequiredValidator}
                    style={{
                      maxHeight: '200px',
                    }}
                  >
                    {({ form }: FieldProps) => (
                      <FormControl
                        isInvalid={Boolean(
                          form.errors.description && form.touched.description,
                        )}
                      >
                        <FormLabel
                          htmlFor="description"
                          fontSize="sm"
                          fontWeight="600"
                        >
                          Description*
                        </FormLabel>
                        <EditorField name="description" />
                        <FormErrorMessage mb="1rem">
                          Please add a description
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </chakra.div>

                <chakra.div mb={3}>
                  <Field name="email" type="email" validate={emailValidator}>
                    {({ field, form }: FieldProps) => (
                      <FormControl
                        isInvalid={Boolean(
                          form.errors.email && form.touched.email,
                        )}
                      >
                        <FormLabel
                          htmlFor="email"
                          fontSize="sm"
                          fontWeight="600"
                        >
                          Contact email for organisation
                        </FormLabel>
                        <Input
                          {...field}
                          id="email"
                          fontSize="sm"
                          shadow="sm"
                          size="sm"
                          rounded="md"
                        />
                        <FormErrorMessage>
                          {form.errors.email?.toString()}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </chakra.div>

                <HStack align="stretch" spacing={2} mt={4}>
                  <chakra.div mb={3} flexGrow={1}>
                    <Field name="website">
                      {({ field, form }: FieldProps) => (
                        <FormControl
                          isInvalid={Boolean(
                            form.errors.website && form.touched.website,
                          )}
                        >
                          <FormLabel
                            htmlFor="title"
                            fontSize="sm"
                            fontWeight="600"
                          >
                            Website
                          </FormLabel>
                          <Input
                            {...field}
                            id="website"
                            fontSize="sm"
                            shadow="sm"
                            size="sm"
                            rounded="md"
                          />
                          <FormErrorMessage>
                            {form.errors.website?.toString()}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </chakra.div>

                  <chakra.div mb={3} flexGrow={1}>
                    <Field name="facebook">
                      {({ field, form }: FieldProps) => (
                        <FormControl
                          isInvalid={Boolean(
                            form.errors.facebook && form.touched.facebook,
                          )}
                        >
                          <FormLabel
                            htmlFor="facebook"
                            fontSize="sm"
                            fontWeight="600"
                          >
                            Facebook
                          </FormLabel>
                          <Input
                            {...field}
                            id="facebook"
                            fontSize="sm"
                            shadow="sm"
                            size="sm"
                            rounded="md"
                          />
                          <FormErrorMessage>
                            {form.errors.facebook?.toString()}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </chakra.div>
                </HStack>

                <HStack align="stretch" spacing={2}>
                  <chakra.div mb={3} flexGrow={1}>
                    <Field name="twitter">
                      {({ field, form }: FieldProps) => (
                        <FormControl
                          isInvalid={Boolean(
                            form.errors.twitter && form.touched.twitter,
                          )}
                        >
                          <FormLabel
                            htmlFor="twitter"
                            fontSize="sm"
                            fontWeight="600"
                          >
                            Twitter
                          </FormLabel>
                          <Input
                            {...field}
                            id="twitter"
                            fontSize="sm"
                            shadow="sm"
                            size="sm"
                            rounded="md"
                          />
                          <FormErrorMessage>
                            {form.errors.twitter?.toString()}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </chakra.div>

                  <chakra.div mb={3} flexGrow={1}>
                    <Field name="instagram">
                      {({ field, form }: FieldProps) => (
                        <FormControl
                          isInvalid={Boolean(
                            form.errors.instagram && form.touched.instagram,
                          )}
                        >
                          <FormLabel
                            htmlFor="instagram"
                            fontSize="sm"
                            fontWeight="600"
                          >
                            Instagram
                          </FormLabel>
                          <Input
                            {...field}
                            id="instagram"
                            fontSize="sm"
                            shadow="sm"
                            size="sm"
                            rounded="md"
                          />
                          <FormErrorMessage>
                            {form.errors.instagram?.toString()}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </chakra.div>
                </HStack>

                <chakra.div>
                  <Field name="seekingVolunteers">
                    {({ field, form }: FieldProps) => (
                      <FormControl
                        isInvalid={Boolean(
                          form.errors.seekingVolunteers &&
                            form.touched.seekingVolunteers,
                        )}
                      >
                        <Checkbox
                          isChecked={field.value}
                          id="seekingVolunteers"
                          onChange={field.onChange}
                          colorScheme="green"
                        >
                          Seeking volunteers
                        </Checkbox>
                        <Text color="gray.500" fontSize="sm">
                          Would this group benefit from having additional
                          volunteers?
                        </Text>
                        <FormErrorMessage>
                          {form.errors.seekingVolunteers?.toString()}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </chakra.div>
              </chakra.div>

              <Box p="0.75rem" bg="gray.50" textAlign="right">
                <Tooltip
                  isDisabled={props.dirty}
                  borderRadius="md"
                  label="You haven't made any changes yet"
                >
                  <Button
                    isDisabled={!props.isValid || !props.dirty}
                    isLoading={props.isSubmitting}
                    size="md"
                    type="submit"
                    variant="rw"
                  >
                    Submit
                  </Button>
                </Tooltip>
              </Box>
            </Form>
          )
        }}
      </Formik>
    </>
  )
}

export default memo(ListingEditReview)
