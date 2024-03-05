import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import {
  chakra,
  Heading,
  Text,
  Button,
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
} from '@chakra-ui/react'
import { Formik, Form, Field, FieldProps, useFormikContext } from 'formik'
import LogoImage from '../../../public/logo.png'

import { fieldRequiredValidator, urlValidator } from '@helpers/formValidation'
import { useCreateWeb } from '@hooks/webs'
import { useAppContext } from '@store/hooks'

const SlugField = () => {
  const {
    values: { title },
    setFieldValue,
  } = useFormikContext<any>()

  useEffect(() => {
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/ /g, '-')
      .replace(/[^a-z0-9-]/gi, '')
      .trim()

    if (title.trim() !== '') {
      setFieldValue('slug', generatedSlug)
    }
  }, [setFieldValue, title])

  return (
    <Field name="slug" validate={urlValidator}>
      {({ field, form }: FieldProps) => {
        return (
          <FormControl
            isInvalid={Boolean(form.errors.slug && form.touched.slug)}
          >
            <FormLabel htmlFor="slug" fontSize="sm" fontWeight="600">
              Link to web
            </FormLabel>
            <InputGroup size="sm">
              <Input
                {...field}
                id="slug"
                fontSize="sm"
                shadow="sm"
                size="sm"
                rounded="md"
              />
              <InputRightAddon
                bg="gray.50"
                color="gray.500"
                rounded="md"
                userSelect="none"
              >
                {`.resilienceweb.org.uk`}
              </InputRightAddon>
            </InputGroup>
            <FormErrorMessage>{form.errors.slug?.toString()}</FormErrorMessage>
          </FormControl>
        )
      }}
    </Field>
  )
}

const WebCreation = () => {
  const { createWeb, isPending, isSuccess, isError, errorMessage } =
    useCreateWeb()
  const { setSelectedWebSlug } = useAppContext()
  const router = useRouter()

  useEffect(() => {
    if (isSuccess) {
      setSelectedWebSlug(undefined)
      router.push('/admin?firstTime=true')
    }
  }, [isSuccess, router, setSelectedWebSlug])

  const onSubmit = useCallback(
    (data) => {
      createWeb({
        ...data,
      })
    },
    [createWeb],
  )

  return (
    <>
      <Box display="flex" justifyContent="center" mb="2rem">
        <Image alt="Resilience Web logo" src={LogoImage} />
      </Box>
      <Heading as="h1">Welcome 👋</Heading>
      <Text mt="1rem">
        You are taking the first steps in setting up a Resilience Web for your
        area, well done! Once you fill out the details below, you will be able
        to start adding listings, inviting collaborators to your team and so
        much more.
      </Text>
      <Box
        shadow="base"
        rounded={[null, 'md']}
        overflow={{ sm: 'hidden' }}
        bg="white"
        padding="1rem"
        mt="1rem"
      >
        <Formik
          initialValues={{
            title: '',
            slug: '',
          }}
          enableReinitialize
          onSubmit={onSubmit}
        >
          {(_props) => {
            return (
              <Form>
                <chakra.div mb={3}>
                  <Field
                    name="title"
                    type="title"
                    validate={fieldRequiredValidator}
                  >
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={Boolean(form.errors.title)}>
                        <FormLabel htmlFor="title" fontWeight="600">
                          Web title
                        </FormLabel>
                        <Input
                          {...field}
                          id="title"
                          background="white"
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

                <chakra.div mb={3} maxW="450px">
                  <SlugField />
                </chakra.div>

                {isError && errorMessage && (
                  <Text color="red.500" fontSize="0.875rem">
                    {`${errorMessage}`}
                  </Text>
                )}

                <Button mt={4} variant="rw" isLoading={isPending} type="submit">
                  Get started
                </Button>
              </Form>
            )
          }}
        </Formik>
      </Box>
    </>
  )
}

export default WebCreation
