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
import { useAllListings } from '@hooks/listings'
import { useWebs } from '@hooks/webs'
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
  const { listings } = useAllListings()
  const { webs } = useWebs({ withListings: true })
  const { mutate: updatePermission, isLoading: isUpdatingPermission } =
    useUpdatePermission()

  const onSubmit = useCallback(
    (data) => {
      const listingIdsAdded = data.listings.map((l) => l.value)
      const listingsToAdd = listings.filter((l) =>
        listingIdsAdded.includes(l.id),
      )

      const webIdsAdded = data.webs.map((s) => s.value)
      const websToAdd = webs.filter((s) => webIdsAdded.includes(s.id))

      const dataToSubmit = {
        email: data.email,
        listings: listingsToAdd,
        webs: websToAdd,
      }
      updatePermission(dataToSubmit)
    },
    [listings, webs, updatePermission],
  )

  const listingOptions = useMemo(() => {
    if (!listings) return []

    return listings.map((l) => ({
      value: l.id,
      label: l.title,
    }))
  }, [listings])

  const webOptions = useMemo(() => {
    return webs.map((l) => ({
      value: l.id,
      label: l.title,
    }))
  }, [webs])

  return (
    <Accordion allowMultiple defaultIndex={[0]}>
      {permissions.map((permission) => {
        const { listings, user, email, locations: webs } = permission

        const getListingSelectedOptions = () => {
          if (!listings) return []

          return listings.map((l) => ({
            value: l.id,
            label: l.title,
          }))
        }

        const getWebsSelectedOptions = () => {
          if (!webs) return []

          return webs.map((s) => ({
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
                    <strong>{webs.length}</strong>{' '}
                    {webs.length === 0 || webs.length > 1 ? 'webs' : 'web'}
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
              <Formik
                enableReinitialize
                initialValues={{
                  email: permission.email,
                  listings: getListingSelectedOptions(),
                  webs: getWebsSelectedOptions(),
                }}
                onSubmit={(values, actions) => {
                  actions.setSubmitting(false)
                  onSubmit(values)
                }}
              >
                {(props) => {
                  return (
                    <Form>
                      <Field name="webs">
                        {({ field, form }: FieldProps) => {
                          return (
                            <FormControl
                              isInvalid={Boolean(
                                form.errors.webs && form.touched.webs,
                              )}
                            >
                              <FormLabel htmlFor="webs">
                                Webs this user has full access to
                              </FormLabel>
                              <InputGroup size="sm" bgColor="whiteAlpha.800">
                                <Select
                                  isMulti
                                  isSearchable
                                  menuPortalTarget={document.body}
                                  onChange={(_option, changeData) => {
                                    let newValue
                                    if (changeData.action === 'select-option') {
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
                                  options={webOptions}
                                  placeholder=""
                                  isClearable={false}
                                  styles={customMultiSelectStyles}
                                  value={field.value}
                                />
                              </InputGroup>
                              <FormErrorMessage>
                                {form.errors.webs?.toString()}
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
                                    if (changeData.action === 'select-option') {
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
                          isDisabled={
                            !props.isValid ||
                            (isEqual(
                              props.initialValues.listings,
                              props.values.listings,
                            ) &&
                              isEqual(
                                props.initialValues.webs,
                                props.values.webs,
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
            </AccordionPanel>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

export default memo(PermissionsList)
