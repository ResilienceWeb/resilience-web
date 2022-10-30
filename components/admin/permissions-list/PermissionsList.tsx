/* eslint-disable sonarjs/cognitive-complexity */
import { memo, useCallback, useMemo } from 'react'
import { Formik, Form, Field, FieldProps } from 'formik'
import isEqual from 'lodash/isEqual'
import {
  Text,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  InputGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Button,
  chakra,
} from '@chakra-ui/react'
import Select from 'react-select'
import { useListings } from '@hooks/listings'
import { useSites } from '@hooks/sites'
import { useUpdatePermission } from '@hooks/permissions'

const customMultiSelectStyles = {
  container: (provided) => ({
    ...provided,
    width: '100%',
  }),
}

const SeparatedElement = chakra('span', {
  baseStyle: {
    _notLast: {
      _after: {
        content: '" ∙ "',
      },
    },
  },
})

const PermissionsList = ({ permissions }) => {
  const { listings } = useListings()
  const { sites } = useSites()
  const { mutate: updatePermission, isLoading: isUpdatingPermission } =
    useUpdatePermission()

  const onSubmit = useCallback(
    (data) => {
      const listingIdsAdded = data.listings.map((l) => l.value)
      const listingsToAdd = listings.filter((l) =>
        listingIdsAdded.includes(l.id),
      )

      const siteIdsAdded = data.sites.map((s) => s.value)
      const sitesToAdd = sites.filter((s) => siteIdsAdded.includes(s.id))

      const dataToSubmit = {
        email: data.email,
        listings: listingsToAdd,
        sites: sitesToAdd,
      }
      updatePermission(dataToSubmit)
    },
    [listings, sites, updatePermission],
  )

  const listingOptions = useMemo(() => {
    if (!listings) return []

    return listings.map((l) => ({
      value: l.id,
      label: l.title,
    }))
  }, [listings])

  const siteOptions = useMemo(() => {
    if (!sites) return []

    return sites.map((l) => ({
      value: l.id,
      label: l.title,
    }))
  }, [sites])

  return (
    <Accordion allowMultiple defaultIndex={[0]}>
      {permissions.map((permission) => {
        const { listings, user, email, locations: sites } = permission

        const getListingSelectedOptions = () => {
          if (!listings) return []

          return listings.map((l) => ({
            value: l.id,
            label: l.title,
          }))
        }

        const getSitesSelectedOptions = () => {
          if (!sites) return []

          return sites.map((s) => ({
            value: s.id,
            label: s.title,
          }))
        }

        return (
          <AccordionItem key={permission.id} bgColor="whiteAlpha.800">
            <h2>
              <AccordionButton _hover={{ bgColor: 'gray.50' }}>
                <Box flex="1" textAlign="left">
                  <SeparatedElement>{email}</SeparatedElement>
                  <SeparatedElement>
                    <strong>{sites.length}</strong>{' '}
                    {sites.length === 0 || sites.length > 1 ? 'sites' : 'site'}
                  </SeparatedElement>
                  <SeparatedElement>
                    <strong>{listings.length}</strong>{' '}
                    {listings.length === 0 || listings.length > 1
                      ? 'listings'
                      : 'listing'}
                  </SeparatedElement>
                  {!user.emailVerified && (
                    <SeparatedElement>
                      <Text display="inline" textColor="orange.500">
                        not signed up yet
                      </Text>
                    </SeparatedElement>
                  )}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              {user.emailVerified ? (
                <Formik
                  enableReinitialize
                  initialValues={{
                    email: permission.email,
                    listings: getListingSelectedOptions(),
                    sites: getSitesSelectedOptions(),
                  }}
                  onSubmit={(values, actions) => {
                    actions.setSubmitting(false)
                    onSubmit(values)
                  }}
                >
                  {(props) => {
                    return (
                      <Form>
                        <Field name="sites">
                          {({ field, form }: FieldProps) => {
                            return (
                              <FormControl
                                isInvalid={Boolean(
                                  form.errors.sites && form.touched.sites,
                                )}
                              >
                                <FormLabel htmlFor="sites">
                                  Sites this user has full access to
                                </FormLabel>
                                <InputGroup size="sm" bgColor="whiteAlpha.800">
                                  <Select
                                    isMulti
                                    isSearchable
                                    menuPortalTarget={document.body}
                                    onChange={(_option, changeData) => {
                                      let newValue
                                      if (
                                        changeData.action === 'select-option'
                                      ) {
                                        newValue = [
                                          ...field.value,
                                          changeData.option,
                                        ]
                                      } else if (
                                        changeData.action === 'remove-value' ||
                                        changeData.action === 'pop-value'
                                      ) {
                                        newValue = field.value.filter(
                                          (v) =>
                                            v.value !==
                                            changeData.removedValue.value,
                                        )
                                      }
                                      form.setFieldValue(field.name, newValue)
                                    }}
                                    options={siteOptions}
                                    placeholder=""
                                    isClearable={false}
                                    styles={customMultiSelectStyles}
                                    value={field.value}
                                  />
                                </InputGroup>
                                <FormErrorMessage>
                                  {form.errors.sites?.toString()}
                                </FormErrorMessage>
                              </FormControl>
                            )
                          }}
                        </Field>

                        <Field name="listings">
                          {({ field, form }: FieldProps) => {
                            return (
                              <FormControl
                                isInvalid={Boolean(
                                  form.errors.listings && form.touched.listings,
                                )}
                                mt="1rem"
                              >
                                <FormLabel htmlFor="listings">
                                  Individual listings this user can edit
                                </FormLabel>
                                <InputGroup size="sm" bgColor="whiteAlpha.800">
                                  <Select
                                    isMulti
                                    isSearchable
                                    menuPortalTarget={document.body}
                                    onChange={(_option, changeData) => {
                                      let newValue
                                      if (
                                        changeData.action === 'select-option'
                                      ) {
                                        newValue = [
                                          ...field.value,
                                          changeData.option,
                                        ]
                                      } else if (
                                        changeData.action === 'remove-value' ||
                                        changeData.action === 'pop-value'
                                      ) {
                                        newValue = field.value.filter(
                                          (v) =>
                                            v.value !==
                                            changeData.removedValue.value,
                                        )
                                      }
                                      form.setFieldValue(field.name, newValue)
                                    }}
                                    options={listingOptions}
                                    placeholder=""
                                    isClearable={false}
                                    styles={customMultiSelectStyles}
                                    value={field.value}
                                  />
                                </InputGroup>
                                <FormErrorMessage>
                                  {form.errors.listings?.toString()}
                                </FormErrorMessage>
                              </FormControl>
                            )
                          }}
                        </Field>

                        <Box
                          pt={3}
                          bg="gray.50"
                          textAlign="left"
                          bgColor="whiteAlpha.800"
                        >
                          <Button
                            bg="rw.700"
                            colorScheme="rw.700"
                            disabled={
                              !props.isValid ||
                              (isEqual(
                                props.initialValues.listings,
                                props.values.listings,
                              ) &&
                                isEqual(
                                  props.initialValues.sites,
                                  props.values.sites,
                                ))
                            }
                            isLoading={isUpdatingPermission}
                            size="md"
                            type="submit"
                            _hover={{ bg: 'rw.900' }}
                          >
                            Update permissions
                          </Button>
                          {/* <Text fontSize="sm" color="blackAlpha.600">
                          This sends an email to the user with the new
                          permissions
                        </Text> */}
                        </Box>
                      </Form>
                    )
                  }}
                </Formik>
              ) : (
                <Text fontSize="sm">
                  You cannot give this user additional permissions until they
                  activate their account.
                </Text>
              )}
            </AccordionPanel>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

export default memo(PermissionsList)
