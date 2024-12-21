import { memo, useEffect, useMemo } from 'react'
import { Formik, Form, Field, useFormikContext } from 'formik'
import type { FieldProps } from 'formik'
import ReactSelect from 'react-select'
import type { Options } from 'react-select'
import type { Category } from '@prisma/client'
import NextLink from 'next/link'
import dynamic from 'next/dynamic'
import {
  chakra,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  FormHelperText,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  HStack,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import {
  emailValidator,
  fieldRequiredValidator,
  urlValidator,
} from '@helpers/formValidation'
import ImageUpload from './ImageUpload'
import useTags from '@hooks/tags/useTags'
import useListings from '@hooks/listings/useListings'
import { useAppContext } from '@store/hooks'
import { generateSlug } from '@helpers/utils'

import EditorField from './RichTextEditor'

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div style={{ textAlign: 'center', paddingTop: 20 }}>Loading…</div>
  ),
})

const SlugField = ({ isEditMode }) => {
  const { selectedWebSlug } = useAppContext()
  const {
    values: { title },
    setFieldValue,
  } = useFormikContext<any>()

  useEffect(() => {
    if (isEditMode) {
      return
    }

    const generatedSlug = generateSlug(title)

    if (title.trim() !== '') {
      setFieldValue('slug', generatedSlug)
    }
  }, [setFieldValue, title, isEditMode])

  return (
    <Field name="slug" validate={urlValidator}>
      {({ field, form }: FieldProps) => {
        return (
          <FormControl
            isInvalid={Boolean(form.errors.slug && form.touched.slug)}
          >
            <FormLabel htmlFor="slug" fontSize="sm" fontWeight="600">
              Link to listing page
            </FormLabel>
            <InputGroup size="sm">
              <InputLeftAddon
                bg="gray.50"
                color="gray.500"
                rounded="md"
                userSelect="none"
              >
                {`${selectedWebSlug}.resilienceweb.org.uk/`}
              </InputLeftAddon>
              <Input
                {...field}
                id="slug"
                fontSize="sm"
                shadow="sm"
                size="sm"
                rounded="md"
              />
            </InputGroup>
            <FormErrorMessage>{form.errors.slug?.toString()}</FormErrorMessage>
          </FormControl>
        )
      }}
    </Field>
  )
}

const customMultiSelectStyles = {
  container: (baseStyles) => ({
    ...baseStyles,
    width: '100%',
  }),
  menuPortal: (baseStyles) => ({
    ...baseStyles,
    zIndex: 10,
  }),
}

interface Props {
  categories: Category[]
  listing?: Listing
  handleSubmit: (data: any) => void
}

type TagOption = {
  value: number
  label: string
}

const ListingForm = ({ categories, listing, handleSubmit }: Props) => {
  const { tags } = useTags()
  const { listings } = useListings()

  const tagOptions: Options<TagOption> = useMemo(() => {
    if (!tags) return []

    return tags.map((t) => ({
      value: t.id,
      label: t.label,
    }))
  }, [tags])

  const relationOptions: Options<TagOption> = useMemo(() => {
    if (!listings) return []

    return listings
      .filter((l) => l.title !== listing?.title)
      .map((l) => ({
        value: l.id,
        label: l.title,
      }))
  }, [listing?.title, listings])

  const initialTagsValues = useMemo(() => {
    return listing?.tags?.map((t) => ({
      value: t.id,
      label: t.label,
    }))
  }, [listing?.tags])

  const initialRelationsValues = useMemo(() => {
    return listing?.relations?.map((l) => ({
      value: l.id,
      label: l.title,
    }))
  }, [listing?.relations])

  const handleSubmitForm = (data) => {
    const isNewImage = data.image instanceof File
    if (!isNewImage && data.image) {
      delete data.image
    }
    if (!data.noPhysicalLocation && data.location) {
      data.latitude = data.location.latitude
      data.longitude = data.location.longitude
      data.locationDescription = data.location.description
      delete data.location
    }
    data.tags = data.tags?.map((t) => t.value)
    data.relations = data.relations?.map((l) => l.value)
    if (listing) {
      const currentListingTagIds = listing?.tags?.map((t) => t.id)
      const removedTags = currentListingTagIds?.filter(
        (t) => !data.tags.includes(t),
      )
      data.removedTags = removedTags

      const currentListingRelationIds = listing?.relations?.map((r) => r.id)
      const removedRelations = currentListingRelationIds?.filter(
        (l) => !data.relations.includes(l),
      )
      data.removedRelations = removedRelations
    }
    handleSubmit(data)
  }

  return (
    <Formik
      initialValues={{
        id: listing?.id || null,
        title: listing?.title || '',
        description: listing?.description || '',
        category: listing?.categoryId || undefined,
        email: listing?.email || '',
        website: listing?.website || '',
        facebook: listing?.facebook || '',
        twitter: listing?.twitter || '',
        instagram: listing?.instagram || '',
        seekingVolunteers: listing?.seekingVolunteers || false,
        featured: listing?.featured || false,
        image: listing?.image,
        slug: listing?.slug || '',
        tags: initialTagsValues || [],
        relations: initialRelationsValues || [],
        noPhysicalLocation: listing?.location?.noPhysicalLocation || false,
        location:
          listing?.location?.latitude && listing?.location?.longitude
            ? {
                latitude: listing.location.latitude,
                longitude: listing.location.longitude,
                description: listing.location.description,
              }
            : undefined,
      }}
      enableReinitialize
      onSubmit={handleSubmitForm}
    >
      {(props) => {
        return (
          <Form encType="multipart/form-data">
            <chakra.div p={{ sm: 6 }} px="1rem" py="1rem">
              <chakra.div mb="0.5rem">
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
                        mb="0.25rem"
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

              <chakra.div mb="0.5rem">
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
                        mb="0.25rem"
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
                      <FormHelperText>
                        {categories.length === 0 ? (
                          <Text>
                            Looks like you haven't created categories yet. You
                            can add some{' '}
                            <NextLink href="/admin/categories">
                              on this page
                            </NextLink>
                            .
                          </Text>
                        ) : (
                          'Categories can be easily changed later'
                        )}
                      </FormHelperText>
                      <FormErrorMessage>
                        Please select a category
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </chakra.div>

              <chakra.div mb="0.5rem">
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
                        mb="0.25rem"
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

              <Field name="image">
                {({ field, form }: FieldProps) => (
                  <ImageUpload field={field} form={form} formProps={props} />
                )}
              </Field>

              <chakra.div mb="0.5rem">
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
                        mb="0.25rem"
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
                          mb="0.25rem"
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
                          mb="0.25rem"
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
                          mb="0.25rem"
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
                          mb="0.25rem"
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

              <chakra.div mb={3}>
                <SlugField isEditMode={Boolean(listing)} />
              </chakra.div>

              <chakra.div mb={3}>
                <Field name="tags">
                  {({ field, form }: FieldProps) => {
                    return (
                      <FormControl
                        isInvalid={Boolean(
                          form.errors.tags && form.touched.tags,
                        )}
                      >
                        <FormLabel
                          htmlFor="tags"
                          fontSize="sm"
                          fontWeight="600"
                          mb="0.25rem"
                        >
                          Tags
                        </FormLabel>
                        <InputGroup size="sm">
                          <ReactSelect
                            isMulti
                            isSearchable={false}
                            menuPortalTarget={document.body}
                            onChange={(_option, changeData) => {
                              let newValue
                              if (changeData.action === 'select-option') {
                                newValue = [...field.value, changeData.option]
                              } else if (
                                changeData.action === 'remove-value' ||
                                changeData.action === 'pop-value'
                              ) {
                                newValue = field.value.filter(
                                  (v) =>
                                    v.value !== changeData.removedValue.value,
                                )
                              }
                              form.setFieldValue(field.name, newValue)
                            }}
                            options={tagOptions.filter((t) => {
                              return !field.value.includes(t)
                            })}
                            placeholder="Tags"
                            value={field.value}
                            isClearable={false}
                            styles={customMultiSelectStyles}
                          />
                        </InputGroup>
                        <FormErrorMessage>
                          {form.errors.tags?.toString()}
                        </FormErrorMessage>
                      </FormControl>
                    )
                  }}
                </Field>
              </chakra.div>

              <chakra.div mb={3}>
                <Field name="relations">
                  {({ field, form }: FieldProps) => {
                    return (
                      <FormControl
                        isInvalid={Boolean(
                          form.errors.relations && form.touched.relations,
                        )}
                      >
                        <FormLabel
                          htmlFor="relations"
                          fontSize="sm"
                          fontWeight="600"
                          mb="0.25rem"
                        >
                          Related listings
                        </FormLabel>
                        <InputGroup size="sm">
                          <ReactSelect
                            isMulti
                            isSearchable
                            menuPortalTarget={document.body}
                            onChange={(_option, changeData) => {
                              let newValue
                              if (changeData.action === 'select-option') {
                                newValue = [...field.value, changeData.option]
                              } else if (
                                changeData.action === 'remove-value' ||
                                changeData.action === 'pop-value'
                              ) {
                                newValue = field.value.filter(
                                  (v) =>
                                    v.value !== changeData.removedValue.value,
                                )
                              }
                              form.setFieldValue(field.name, newValue)
                            }}
                            options={relationOptions.filter(
                              (t) => !field?.value?.includes(t),
                            )}
                            placeholder="Related listings"
                            value={field.value}
                            isClearable={false}
                            styles={customMultiSelectStyles}
                          />
                        </InputGroup>
                        <FormErrorMessage>
                          {form.errors.relations?.toString()}
                        </FormErrorMessage>
                      </FormControl>
                    )
                  }}
                </Field>
                <Text color="gray.500" fontSize="sm">
                  Link to other listings that this relates to
                </Text>
              </chakra.div>

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

              <chakra.div mt="0.5rem">
                <Field name="featured">
                  {({ field, form }: FieldProps) => (
                    <FormControl
                      isInvalid={Boolean(
                        form.errors.featured && form.touched.featured,
                      )}
                    >
                      <Checkbox
                        isChecked={field.value}
                        id="featured"
                        onChange={field.onChange}
                        colorScheme="green"
                      >
                        Featured
                      </Checkbox>
                      <Text color="gray.500" fontSize="sm">
                        Display this listing at the top of the page for 7 days.
                      </Text>
                      <FormErrorMessage>
                        {form.errors.featured?.toString()}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </chakra.div>
            </chakra.div>

            <chakra.div px="1.5rem" mt="0.5rem">
              <Field name="noPhysicalLocation">
                {({ field, form }: FieldProps) => (
                  <FormControl
                    isInvalid={Boolean(
                      form.errors.noPhysicalLocation &&
                        form.touched.noPhysicalLocation,
                    )}
                  >
                    <FormLabel
                      htmlFor="relations"
                      fontSize="sm"
                      fontWeight="600"
                      mb="0.25rem"
                    >
                      Location
                    </FormLabel>
                    <Checkbox
                      isChecked={field.value}
                      id="noPhysicalLocation"
                      onChange={field.onChange}
                      colorScheme="green"
                    >
                      No physical location
                    </Checkbox>
                    <FormErrorMessage>
                      {form.errors.noPhysicalLocation?.toString()}
                    </FormErrorMessage>
                  </FormControl>
                )}
              </Field>
            </chakra.div>

            <Field name="location">
              {({ field, form }: FieldProps) => {
                return (
                  <Map
                    latitude={field.value?.latitude}
                    longitude={field.value?.longitude}
                    locationDescription={field.value?.description}
                    noPhysicalLocation={form.values.noPhysicalLocation}
                  />
                )
              }}
            </Field>

            <Box p="0.75rem" bg="gray.50" textAlign="right">
              <Tooltip
                isDisabled={props.dirty}
                borderRadius="md"
                label="You haven't made any changes yet"
              >
                <Button
                  bg={listing?.pending ? 'purple.600' : 'rw.700'}
                  colorScheme={listing?.pending ? 'purple' : 'rw.700'}
                  isLoading={props.isSubmitting}
                  isDisabled={!props.dirty}
                  size="md"
                  type="submit"
                  _hover={{ bg: listing?.pending ? 'purple.700' : 'rw.900' }}
                >
                  {listing
                    ? listing.pending
                      ? 'Approve'
                      : 'Update'
                    : 'Create'}
                </Button>
              </Tooltip>
            </Box>
          </Form>
        )
      }}
    </Formik>
  )
}

export default memo(ListingForm)
