import { memo, useCallback, useMemo } from 'react'
import { Formik, Form, Field, FieldProps } from 'formik'
import isEqual from 'lodash/isEqual'
import { useSession } from 'next-auth/react'
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
  Badge,
  Stack,
} from '@chakra-ui/react'
import Select from 'react-select'
import useListings from '@hooks/listings/useListings'
import useWebs from '@hooks/webs/useWebs'
import useUpdatePermission from '@hooks/permissions/useUpdatePermission'
import { useAppContext } from '@store/hooks'

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
  const { webs } = useWebs()
  const { data: session } = useSession()
  const { selectedWebId } = useAppContext()
  const { mutate: updatePermission, isPending: isUpdatingPermission } =
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

  return (
    <Accordion allowMultiple defaultIndex={[0]}>
      {permissions.map((permission) => {
        const { listings, user, email, webs } = permission

        const getListingSelectedOptions = () => {
          if (!listings) return []

          return listings.map((l) => ({
            value: l.id,
            label: l.title,
          }))
        }

        if (user.id === session?.user?.id) {
          return (
            <Box
              key="current-user"
              bgColor="whiteAlpha.800"
              borderBottom="1px solid rgb(226, 232, 240)"
              p="1rem"
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Text>
                  {session?.user.email}
                  <b>&nbsp;(You)</b>
                </Text>
                <Badge>Owner</Badge>
              </Stack>
            </Box>
          )
        }

        if (webs.some((w) => w.id === selectedWebId)) {
          return (
            <Box
              key={user.id}
              bgColor="whiteAlpha.800"
              borderBottom="1px solid rgb(226, 232, 240)"
              p="1rem"
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Text>{user.email}</Text>
                <Badge>Owner</Badge>
              </Stack>
            </Box>
          )
        }

        return (
          <AccordionItem key={permission.id} bgColor="whiteAlpha.800">
            <h2>
              <AccordionButton _hover={{ bgColor: 'gray.50' }}>
                <Box flex="1" textAlign="left">
                  <SeparatedElement>{email}</SeparatedElement>
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
                          isDisabled={
                            !props.isValid ||
                            isEqual(
                              props.initialValues.listings,
                              props.values.listings,
                            )
                          }
                          isLoading={isUpdatingPermission}
                          size="md"
                          type="submit"
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
