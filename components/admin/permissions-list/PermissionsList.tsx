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
} from '@chakra-ui/react'
import Select from 'react-select'
import { useListings } from '@hooks/listings'
import { useUpdatePermission } from '@hooks/permissions'

const customMultiSelectStyles = {
  container: (provided) => ({
    ...provided,
    width: '100%',
  }),
}

const PermissionsList = ({ permissions }) => {
  const { listings } = useListings()
  const { mutate: updatePermission, isLoading: isUpdatingPermission } =
    useUpdatePermission()

  const onSubmit = useCallback(
    (data) => {
      const listingIdsAdded = data.listings.map((l) => l.value)
      const listingsToAdd = listings.filter((l) =>
        listingIdsAdded.includes(l.id),
      )
      const dataToSubmit = {
        email: data.email,
        listings: listingsToAdd,
      }
      updatePermission(dataToSubmit)
    },
    [listings, updatePermission],
  )

  const listingOptions = useMemo(() => {
    if (!listings) return []

    return listings.map((l) => ({
      value: l.id,
      label: l.title,
    }))
  }, [listings])

  return (
    <Accordion allowMultiple defaultIndex={[0]}>
      {permissions.map((permission) => {
        const { listings, user, email } = permission

        const getListingSelectedOptions = () => {
          if (!listings) return []

          return listings.map((l) => ({
            value: l.id,
            label: l.title,
          }))
        }

        return (
          <AccordionItem key={permission.id} bgColor="whiteAlpha.800">
            <h2>
              <AccordionButton _hover={{ bgColor: 'gray.50' }}>
                <Box flex="1" textAlign="left">
                  {email} ∙ <strong>{listings.length}</strong>{' '}
                  {listings.length > 1 ? 'listings' : 'listing'}
                  {!user.emailVerified && (
                    <>
                      {' '}
                      ∙
                      <Text display="inline" textColor="orange.500">
                        {' '}
                        not signed up yet
                      </Text>
                    </>
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
                  }}
                  onSubmit={(values, actions) => {
                    actions.setSubmitting(false)
                    onSubmit(values)
                  }}
                >
                  {(props) => {
                    return (
                      <Form>
                        <Field name="listings">
                          {({ field, form }: FieldProps) => {
                            return (
                              <FormControl
                                isInvalid={Boolean(
                                  form.errors.listings && form.touched.listings,
                                )}
                              >
                                <FormLabel htmlFor="listings">
                                  Listings this user can edit
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
                              isEqual(
                                props.initialValues.listings,
                                props.values.listings,
                              )
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
